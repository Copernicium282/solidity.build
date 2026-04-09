// public/compiler-worker.js 
// Solidity Compiler Worker with Robust Library Support
importScripts('https://binaries.soliditylang.org/bin/soljson-v0.8.26+commit.8a97fa7a.js');

let solcCompile = null;

/*
 * Polling interval for compiler initialization.
 * The soljson.js binary is a massive WASM module that loads asynchronously.
 * We must wait for the Emscripten `cwrap` function to become available 
 * on the global scope before we can bind the C++ 'solidity_compile' function.
 */
let initInterval = setInterval(function() {
    let target = self.Module;
    if (!target) {
        target = self;
    }
    
    if (target && typeof target.cwrap === 'function') {
        try {
            solcCompile = target.cwrap('solidity_compile', 'string', ['string']);
            clearInterval(initInterval);
        } catch (e) {
            // ignore and try again next tick
        }
    }
}, 100);

// In-memory cache for downloaded dependencies (like OpenZeppelin contracts).
// Because this worker is instantiated once as a singleton in App.jsx,
// this cache stays alive across multiple user compilation requests, dramatically
// speeding up subsequent compiles by avoiding redundant CDN fetches.
const libraryCache = new Map();

function resolvePath(base, relative) {
    let stack = base.split("/");
    let parts = relative.split("/");
    
    // remove file name from base
    stack.pop(); 
    
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part === ".") {
            continue;
        }
        if (part === "..") {
            if (stack.length > 0) {
                stack.pop();
            }
        } else {
            stack.push(part);
        }
    }
    return stack.join("/");
}

async function resolveImports(sources) {
    let newSources = Object.assign({}, sources);
    let processed = []; // Track visited files to prevent infinite loops on circular imports
    let toProcess = Object.keys(sources);

    while (toProcess.length > 0) {
        let fileName = toProcess.shift();
        
        if (processed.includes(fileName)) {
            continue;
        }
        processed.push(fileName);

        let content = newSources[fileName].content;
        
        // BUG FIX: Strip multi-line comments (/* ... */) before scanning for imports
        let noBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, '');

        // Strip single-line comments (// ...) to avoid grabbing phantom imports
        let lines = noBlockComments.split('\n');
        let cleanLines = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.trim().startsWith('//')) {
                continue;
            }
            cleanLines.push(line);
        }
        let cleanContent = cleanLines.join('\n');
        
        /*
         * DEPENDENCY RESOLUTION STRATEGY:
         * We do a naive string split on "import " instead of a full AST parse.
         * This is fast but has limitations (e.g. multi-line imports might break).
         * 
         * We intercept import paths and reroute them to JsDelivr CDN.
         * Be aware: This currently assumes `@openzeppelin/` packages and specifically
         * formatted `github.com/` URLs. Deeply nested arbitrary dependencies
         * will likely fail to resolve.
         */
        let importPaths = [];
        let tokens = cleanContent.split('import ');
        for (let i = 1; i < tokens.length; i++) {
            let token = tokens[i];
            
            // The path is typically inside the first set of quotes
            let firstQuote = token.indexOf('"');
            if (firstQuote === -1) {
                firstQuote = token.indexOf("'");
            }
            
            if (firstQuote !== -1) {
                let quoteChar = token.charAt(firstQuote);
                let secondQuote = token.indexOf(quoteChar, firstQuote + 1);
                
                if (secondQuote !== -1) {
                    importPaths.push(token.substring(firstQuote + 1, secondQuote));
                }
            }
        }
        
        for (let i = 0; i < importPaths.length; i++) {
            let importPath = importPaths[i];
            let resolvedKey = importPath;
            let url = "";

            if (importPath.startsWith('@openzeppelin/')) {
                resolvedKey = importPath;
                url = "https://cdn.jsdelivr.net/npm/" + importPath;
            } 
            else if (importPath.startsWith('github.com/')) {
                // Support github.com/owner/repo/blob/main/Path.sol -> CDN
                url = importPath.replace('github.com/', 'https://cdn.jsdelivr.net/gh/').replace('/blob/', '@');
            } 
            else if (importPath.startsWith('.') && fileName.includes('/')) {
                resolvedKey = resolvePath(fileName, importPath);
                
                // We assume relative imports stay within the same base URL (e.g. JSDelivr for OZ)
                if (fileName.startsWith('@openzeppelin/')) {
                    url = "https://cdn.jsdelivr.net/npm/" + resolvedKey;
                } else {
                    // Fallback for other domains if we can track them
                    // For now, OZ is the primary use case
                }
            }

            if (url && !newSources[resolvedKey]) {
                try {
                    if (libraryCache.has(url)) {
                        newSources[resolvedKey] = { content: libraryCache.get(url) };
                    } else {
                        const res = await fetch(url);
                        if (res.status === 200) {
                            const text = await res.text();
                            libraryCache.set(url, text);
                            newSources[resolvedKey] = { content: text };
                        }
                    }
                    if (newSources[resolvedKey]) {
                        toProcess.push(resolvedKey);
                    }
                } catch (e) {
                    console.error("Fetch error", url, e);
                }
            }
        }
    }
    
    return newSources;
}

onmessage = async function(e) {
    let sourceCode = e.data.sourceCode;
    
    // Polling function to wait for compiler to load
    let run = async function() {
        if (!solcCompile) { 
            setTimeout(run, 100); 
            return; 
        }
        
        let sources = { 
            'contract.sol': { 
                content: sourceCode 
            } 
        };
        
        try {
            sources = await resolveImports(sources);
            let input = {
                language: 'Solidity',
                sources: sources,
                settings: { 
                    outputSelection: { 
                        '*': { 
                            '*': ['*'] 
                        } 
                    } 
                }
            };
            
            let inputString = JSON.stringify(input);
            let outputString = solcCompile(inputString);
            let output = JSON.parse(outputString);
            
            postMessage({ success: true, output: output });
        } catch (err) {
            postMessage({ success: false, error: err.message });
        }
    };
    
    run();
};
