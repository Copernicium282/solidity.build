// public/compiler-worker.js 
// Solidity Compiler Worker with Robust Library Support
importScripts('https://binaries.soliditylang.org/bin/soljson-v0.8.26+commit.8a97fa7a.js');

let solcCompile = null;

/*
 * Polling interval for compiler init.
 * soljson.js WASM loads async. Wait Emscripten `cwrap` globally
 * to bind C++ 'solidity_compile'.
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
            // Ignore. Retry next tick.
        }
    }
}, 100);

// In-memory cache for downloaded deps (OpenZeppelin).
// Singleton worker App.jsx maintains cache across requests.
// Speed up compiles, skip CDN fetches.
const libraryCache = new Map();

function resolvePath(base, relative) {
    let stack = base.split("/");
    let parts = relative.split("/");
    
    // Remove file name from base.
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
    let processed = []; // Track visited files → prevent circular import infinite loops.
    let toProcess = Object.keys(sources);

    while (toProcess.length > 0) {
        let fileName = toProcess.shift();
        
        if (processed.includes(fileName)) {
            continue;
        }
        processed.push(fileName);

        let content = newSources[fileName].content;
        
        // nuke comments
        const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

        // find import paths for CDN routing
        const importPaths = [];
        const importRegex = /import\s+(?:\{[^}]+\}\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(cleanContent)) !== null) {
            importPaths.push(match[1]);
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
                // Support github → CDN.
                url = importPath.replace('github.com/', 'https://cdn.jsdelivr.net/gh/').replace('/blob/', '@');
            } 
            else if (importPath.startsWith('.') && fileName.includes('/')) {
                resolvedKey = resolvePath(fileName, importPath);
                
                // Assume relative imports share base URL.
                if (fileName.startsWith('@openzeppelin/')) {
                    url = "https://cdn.jsdelivr.net/npm/" + resolvedKey;
                } else {
                    // Fallback domains untracked. OZ primary.
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
    
    // Poll for compiler load.
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
