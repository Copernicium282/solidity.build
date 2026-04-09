/**
 * Solidity Code Generation Utility
 * Converts a block tree into a valid Solidity source string.
 */

export const generateSolidity = (blocks, solVersion) => {
    let inheritances = [];
    
    /**
     * Recursively scans the AST (blocks tree) to find all 'Contract' 
     * nodes and extract their inheritance fields (e.g. "ERC20, Ownable").
     * This allows us to auto-inject the OpenZeppelin imports at the top
     * of the file before rendering the rest of the code.
     */
    const walkForInheritance = (list) => {
        for (let i = 0; i < list.length; i++) {
            let block = list[i];
            if (block.data && block.data.inheritance) {
                let parts = block.data.inheritance.split(',');
                for (let j = 0; j < parts.length; j++) {
                    let trimPart = parts[j].trim();
                    if (trimPart && !inheritances.includes(trimPart)) {
                        inheritances.push(trimPart);
                    }
                }
            }
            if (block.children && block.children.length > 0) {
                walkForInheritance(block.children);
            }
        }
    };
    
    walkForInheritance(blocks);

    let codeSnippet = "// SPDX-License-Identifier: MIT\n";
    codeSnippet += "pragma solidity " + solVersion + ";\n\n";

    let hasImports = false;
    
    if (inheritances.includes('ERC20')) { 
        codeSnippet += 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n'; 
        hasImports = true; 
    }
    
    if (inheritances.includes('ERC721')) { 
        codeSnippet += 'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n'; 
        hasImports = true; 
    }
    
    if (inheritances.includes('Ownable')) { 
        codeSnippet += 'import "@openzeppelin/contracts/access/Ownable.sol";\n'; 
        hasImports = true; 
    }
    
    if (hasImports) {
        codeSnippet += "\n";
    }

    /**
     * The core code generator. Recursively walks the blocks array and
     * maps each block's type and configuration into a Solidity string.
     * 
     * @param {Array} blockList The array of blocks to render
     * @param {string} indent Current indentation string (e.g. "    ")
     * @param {boolean} isInterface If true, functions render with semicolons instead of bodies
     * @returns {string} The generated Solidity snippet
     */
    const renderList = (blockList, indent = "", isInterface = false) => {
        let output = "";
        
        for (let idx = 0; idx < blockList.length; idx++) {
            let block = blockList[idx];
            let nextBlock = blockList[idx + 1];
            
            let followedByElse = false;
            if (nextBlock && (nextBlock.type === 'ElseIf' || nextBlock.type === 'Else')) {
                followedByElse = true;
            }
            
            if (block.type === "Contract") {
                // ═══════ CONTRACT ═══════
                let inherits = "";
                if (block.data && block.data.inheritance) {
                    inherits = " is " + block.data.inheritance;
                }
                
                let name = "MyContract";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                output += indent + "contract " + name + inherits + " {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n\n";
            }
            else if (block.type === "Function") {
                // ═══════ FUNCTION ═══════
                let argsArray = [];
                if (block.data && block.data.params) {
                    for (let i = 0; i < block.data.params.length; i++) {
                        let p = block.data.params[i];
                        argsArray.push(p.type + " " + p.name);
                    }
                }
                let args = argsArray.join(", ");
                
                let vis = "public";
                if (block.data && block.data.visibility) {
                    vis = block.data.visibility;
                }
                
                let mut = "";
                if (block.data && block.data.mutability) {
                    mut = " " + block.data.mutability;
                }
                
                let virt = "";
                if (block.data && block.data.isVirtual) {
                    virt = " virtual";
                }
                
                let over = "";
                if (block.data && block.data.isOverride) {
                    if (block.data.overrideParents) {
                        over = " override" + block.data.overrideParents;
                    } else {
                        over = " override";
                    }
                }
                
                let mods = "";
                if (block.data && block.data.modifiers) {
                    mods = " " + block.data.modifiers;
                }
                
                let ret = "";
                if (block.data && block.data.returns) {
                    ret = " returns (" + block.data.returns + ")";
                }

                let funcName = "func";
                if (block.data && block.data.name) {
                    funcName = block.data.name;
                }

                if (isInterface) {
                    output += "\n" + indent + "function " + funcName + "(" + args + ") " + vis + mut + virt + over + mods + ret + ";\n";
                } else {
                    output += "\n" + indent + "function " + funcName + "(" + args + ") " + vis + mut + virt + over + mods + ret + " {\n";
                    
                    // Call the kids recurser lol
                    let children = block.children || [];
                    output += renderList(children, indent + "    ", false);
                    
                    output += indent + "}\n";
                }
            }
            else if (block.type === "Logic") {
                let code = "";
                if (block.data && block.data.code) {
                    code = block.data.code;
                }
                
                let lines = code.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    output += indent + lines[i] + "\n";
                }
            }
            else if (block.type === "State Var") {
                // ═══════ STATE VARIABLE ═══════
                let baseType = "uint256";
                if (block.data && block.data.isCustomType) {
                    baseType = block.data.customType || "Status";
                } else if (block.data && block.data.varType) {
                    baseType = block.data.varType;
                }

                let vis = "internal";
                if (block.data && block.data.visibility) {
                    vis = block.data.visibility;
                }

                let mods = [];
                if (block.data && block.data.isConst) {
                    mods.push("constant");
                }
                if (block.data && block.data.isImm) {
                    mods.push("immutable");
                }
                
                let modSpacer = "";
                if (mods.length > 0) {
                    modSpacer = " " + mods.join(" ");
                }
                
                let name = "v";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                let finalName = name;
                if (block.data && block.data.isConst) {
                    finalName = name.toUpperCase();
                }
                
                if (block.data && block.data.isImm) {
                    finalName = "i_" + finalName;
                }
                
                let val = "";
                if (block.data && block.data.value) {
                    val = " = " + block.data.value;
                }
                
                output += indent + baseType + " " + vis + modSpacer + " " + finalName + val + ";\n";
            }
            else if (block.type === "Mapping") {
                let types = ["address", "uint256"];
                if (block.data && block.data.types) {
                    types = block.data.types;
                }
                
                let vis = "public";
                if (block.data && block.data.visibility) {
                    vis = block.data.visibility;
                }
                
                let name = "myMap";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                // Helper to build mapping string
                let buildMapping = function(tl) {
                    if (tl.length <= 1) {
                        return tl[0];
                    }
                    let current = tl[0];
                    let rest = tl.slice(1);
                    return "mapping(" + current + " => " + buildMapping(rest) + ")";
                };
                
                output += indent + buildMapping(types) + " " + vis + " " + name + ";\n";
            }
            else if (block.type === "Comment") {
                let text = "";
                if (block.data && block.data.text) {
                    text = block.data.text;
                }
                let lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    output += indent + "// " + lines[i] + "\n";
                }
            }
            else if (block.type === "Constructor") {
                let argsArray = [];
                if (block.data && block.data.params) {
                    for (let i = 0; i < block.data.params.length; i++) {
                        let p = block.data.params[i];
                        argsArray.push(p.type + " " + p.name);
                    }
                }
                let args = argsArray.join(", ");
                
                let mut = "";
                if (block.data && block.data.mutability) {
                    mut = " " + block.data.mutability;
                }
                
                let inits = "";
                if (block.data && block.data.initializers) {
                    inits = " " + block.data.initializers;
                }
                
                output += "\n" + indent + "constructor(" + args + ")" + mut + inits + " {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "Modifier") {
                let argsArray = [];
                if (block.data && block.data.params) {
                    for (let i = 0; i < block.data.params.length; i++) {
                        let p = block.data.params[i];
                        argsArray.push(p.type + " " + p.name);
                    }
                }
                let args = argsArray.join(", ");
                
                let name = "mod";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                output += "\n" + indent + "modifier " + name + "(" + args + ") {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "While") {
                let condition = "true";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                output += "\n" + indent + "while (" + condition + ") {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "For") {
                let init = "uint256 i = 0";
                if (block.data && block.data.init) {
                    init = block.data.init;
                }
                
                let condition = "i < 10";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                let step = "i++";
                if (block.data && block.data.step) {
                    step = block.data.step;
                }
                
                output += "\n" + indent + "for (" + init + "; " + condition + "; " + step + ") {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "If") {
                let condition = "true";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                output += indent + "if (" + condition + ") {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}";
                if (!followedByElse) {
                    output += "\n";
                }
            }
            else if (block.type === "ElseIf") {
                let condition = "true";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                output += " else if (" + condition + ") {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}";
                if (!followedByElse) {
                    output += "\n";
                }
            }
            else if (block.type === "Else") {
                output += " else {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "Ternary") {
                let condition = "_x < 10";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                let t = "1";
                if (block.data && block.data.trueVal) {
                    t = block.data.trueVal;
                }
                
                let f = "2";
                if (block.data && block.data.falseVal) {
                    f = block.data.falseVal;
                }
                
                output += indent + "return " + condition + " ? " + t + " : " + f + ";\n";
            }
            else if (block.type === "Array") {
                let base = "uint256";
                if (block.data && block.data.isCustomType) {
                    base = block.data.customType || "Status";
                } else if (block.data && block.data.itemType) {
                    base = block.data.itemType;
                }
                
                let fixedSize = "";
                if (block.data && block.data.fixedSize) {
                    fixedSize = block.data.fixedSize;
                }
                
                let vis = "public";
                if (block.data && block.data.visibility) {
                    vis = block.data.visibility;
                }
                
                let name = "arr";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                let val = "";
                if (block.data && block.data.value) {
                    val = " = " + block.data.value;
                }
                
                output += indent + base + "[" + fixedSize + "] " + vis + " " + name + val + ";\n";
            }
            else if (block.type === "Enum") {
                let name = "Status";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                output += indent + "enum " + name + " {\n";
                
                let members = ["Pending"];
                if (block.data && block.data.members) {
                    members = block.data.members;
                }
                
                for (let i = 0; i < members.length; i++) {
                    output += indent + "    " + members[i];
                    if (i < members.length - 1) {
                        output += ",\n";
                    } else {
                        output += "\n";
                    }
                }
                output += indent + "}\n\n";
            }
            else if (block.type === "Library") {
                let name = "MyLibrary";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                output += "\n" + indent + "library " + name + " {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                
                output += indent + "}\n";
            }
            else if (block.type === "Interface") {
                let name = "ICounter";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                output += "\n" + indent + "interface " + name + " {\n";
                
                let children = block.children || [];
                output += renderList(children, indent + "    ", true);
                
                output += indent + "}\n";
            }
            else if (block.type === "Struct") {
                let name = "Todo";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                output += "\n" + indent + "struct " + name + " {\n";
                
                let members = [];
                if (block.data && block.data.members) {
                    members = block.data.members;
                }
                
                for (let i = 0; i < members.length; i++) {
                    let m = members[i];
                    output += indent + "    " + m.type + " " + m.name + ";\n";
                }
                
                output += "\n" + indent + "}\n";
            }
            else if (block.type === "Require") {
                let condition = "true";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                let msg = "";
                if (block.data && block.data.message) {
                    msg = ', "' + block.data.message + '"';
                }
                
                output += indent + "require(" + condition + msg + ");\n";
            }
            else if (block.type === "Assert") {
                let condition = "true";
                if (block.data && block.data.condition) {
                    condition = block.data.condition;
                }
                
                let msg = "";
                if (block.data && block.data.message) {
                    msg = ', "' + block.data.message + '"';
                }
                
                output += indent + "assert(" + condition + msg + ");\n";
            }
            else if (block.type === "Revert") {
                let msg = "Error";
                if (block.data && block.data.message) {
                    msg = block.data.message;
                }
                
                if (msg.includes('(')) {
                    output += indent + "revert " + msg + ";\n";
                } else {
                    output += indent + 'revert("' + msg + '");\n';
                }
            }
            else if (block.type === "Event") {
                let name = "Log";
                if (block.data && block.data.name) {
                    name = block.data.name;
                }
                
                let params = [];
                if (block.data && block.data.params) {
                    params = block.data.params;
                }
                
                let argsArray = [];
                for (let i = 0; i < params.length; i++) {
                    let p = params[i];
                    let indexed = "";
                    if (p.indexed) {
                        indexed = " indexed";
                    }
                    argsArray.push(p.type + indexed + " " + p.name);
                }
                let args = argsArray.join(", ");
                
                output += indent + "event " + name + "(" + args + ");\n";
            }
            else if (block.type === "Emit") {
                let statement = "Log()";
                if (block.data && block.data.statement) {
                    statement = block.data.statement;
                }
                
                output += indent + "emit " + statement + ";\n";
            }
            else if (block.type === "Receive") {
                output += "\n" + indent + "receive() external payable {\n";
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                output += indent + "}\n";
            }
            else if (block.type === "Fallback") {
                let mut = "";
                if (block.data && block.data.mutability) {
                    mut = " " + block.data.mutability;
                }
                
                output += "\n" + indent + "fallback() external" + mut + " {\n";
                let children = block.children || [];
                output += renderList(children, indent + "    ", false);
                output += indent + "}\n";
            }
        }
        
        return output;
    };

    return codeSnippet + renderList(blocks, "", false);
};
