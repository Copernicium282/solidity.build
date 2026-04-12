/**
 * Solidity Code Generator
 * Traverses the visual block tree and generates valid Solidity code strings.
 */

export const generateSolidity = (blocks, solVersion) => {
    let inheritances = new Set();
    
    // Auto-inject OZ imports by scanning Contract blocks.
    const walkForInheritance = (list) => {
        for (const block of list) {
            if (block.data?.inheritance) {
                block.data.inheritance.split(',')
                    .map(part => part.trim())
                    .filter(Boolean)
                    .forEach(part => inheritances.add(part));
            }
            if (block.children?.length > 0) {
                walkForInheritance(block.children);
            }
        }
    };
    
    walkForInheritance(blocks);

    let codeSnippet = "// SPDX-License-Identifier: MIT\n" +
                      "pragma solidity " + solVersion + ";\n\n";

    let hasImports = false;
    if (inheritances.has('ERC20')) { 
        codeSnippet += 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n'; hasImports = true; 
    }
    if (inheritances.has('ERC721')) { 
        codeSnippet += 'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n'; hasImports = true; 
    }
    if (inheritances.has('Ownable')) { 
        codeSnippet += 'import "@openzeppelin/contracts/access/Ownable.sol";\n'; hasImports = true; 
    }
    if (hasImports) codeSnippet += "\n";

    // Defines how each block type is transformed into Solidity code.
    const BlockTransformers = {
        Contract: (block, indent, renderList) => {
            const inherits = block.data?.inheritance ? " is " + block.data.inheritance : "";
            const name = block.data?.name || "MyContract";
            return `${indent}contract ${name}${inherits} {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n\n`;
        },
        Function: (block, indent, renderList, isInterface) => {
            const args = (block.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
            const vis = block.data?.visibility || "public";
            const mut = block.data?.mutability ? " " + block.data.mutability : "";
            const virt = block.data?.isVirtual ? " virtual" : "";
            let over = "";
            if (block.data?.isOverride) {
                over = block.data.overrideParents ? ` override${block.data.overrideParents}` : " override";
            }
            const mods = block.data?.modifiers ? " " + block.data.modifiers : "";
            const ret = block.data?.returns ? ` returns (${block.data.returns})` : "";
            const funcName = block.data?.name || "func";
            
            const decl = `\n${indent}function ${funcName}(${args}) ${vis}${mut}${virt}${over}${mods}${ret}`;
            if (isInterface) return decl + ";\n";
            return decl + " {\n" + renderList(block.children || [], indent + "    ", false) + `${indent}}\n`;
        },
        Logic: (block, indent) => {
            const lines = (block.data?.code || "").split('\n');
            return lines.map(line => `${indent}${line}\n`).join('');
        },
        "State Var": (block, indent) => {
            const baseType = block.data?.isCustomType ? (block.data?.customType || "Status") : (block.data?.varType || "uint256");
            const vis = block.data?.visibility || "internal";
            const mods = [];
            if (block.data?.isConst) mods.push("constant");
            if (block.data?.isImm) mods.push("immutable");
            const modSpacer = mods.length > 0 ? " " + mods.join(" ") : "";
            
            let name = block.data?.name || "v";
            if (block.data?.isConst) name = name.toUpperCase();
            if (block.data?.isImm) name = "i_" + name;
            const val = block.data?.value ? " = " + block.data.value : "";
            return `${indent}${baseType} ${vis}${modSpacer} ${name}${val};\n`;
        },
        Mapping: (block, indent) => {
            const types = block.data?.types || ["address", "uint256"];
            const vis = block.data?.visibility || "public";
            const name = block.data?.name || "myMap";
            
            const buildMapping = (tl) => tl.length <= 1 ? tl[0] : `mapping(${tl[0]} => ${buildMapping(tl.slice(1))})`;
            return `${indent}${buildMapping(types)} ${vis} ${name};\n`;
        },
        Comment: (block, indent) => {
            return (block.data?.text || "").split('\n').map(line => `${indent}// ${line}\n`).join('');
        },
        Constructor: (block, indent, renderList) => {
            const args = (block.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
            const mut = block.data?.mutability ? " " + block.data.mutability : "";
            const inits = block.data?.initializers ? " " + block.data.initializers : "";
            return `\n${indent}constructor(${args})${mut}${inits} {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        Modifier: (block, indent, renderList) => {
            const args = (block.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
            const name = block.data?.name || "mod";
            return `\n${indent}modifier ${name}(${args}) {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        While: (block, indent, renderList) => {
            const condition = block.data?.condition || "true";
            return `\n${indent}while (${condition}) {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        For: (block, indent, renderList) => {
            const init = block.data?.init || "uint256 i = 0";
            const condition = block.data?.condition || "i < 10";
            const step = block.data?.step || "i++";
            return `\n${indent}for (${init}; ${condition}; ${step}) {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        If: (block, indent, renderList, _, followedByElse) => {
            const condition = block.data?.condition || "true";
            let out = `${indent}if (${condition}) {\n` + 
                      renderList(block.children || [], indent + "    ", false) + 
                      `${indent}}`;
            return out + (followedByElse ? "" : "\n");
        },
        ElseIf: (block, indent, renderList, _, followedByElse) => {
            const condition = block.data?.condition || "true";
            let out = ` else if (${condition}) {\n` + 
                      renderList(block.children || [], indent + "    ", false) + 
                      `${indent}}`;
            return out + (followedByElse ? "" : "\n");
        },
        Else: (block, indent, renderList) => {
            return " else {\n" + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        Ternary: (block, indent) => {
            const cond = block.data?.condition || "_x < 10";
            const t = block.data?.trueVal || "1";
            const f = block.data?.falseVal || "2";
            return `${indent}return ${cond} ? ${t} : ${f};\n`;
        },
        Array: (block, indent) => {
            const base = block.data?.isCustomType ? (block.data?.customType || "Status") : (block.data?.itemType || "uint256");
            const fixedSize = block.data?.fixedSize || "";
            const vis = block.data?.visibility || "public";
            const name = block.data?.name || "arr";
            const val = block.data?.value ? " = " + block.data.value : "";
            return `${indent}${base}[${fixedSize}] ${vis} ${name}${val};\n`;
        },
        Enum: (block, indent) => {
            const name = block.data?.name || "Status";
            const members = block.data?.members || ["Pending"];
            return `${indent}enum ${name} {\n` + 
                   members.map(m => `${indent}    ${m}`).join(",\n") + 
                   `\n${indent}}\n\n`;
        },
        Library: (block, indent, renderList) => {
            const name = block.data?.name || "MyLibrary";
            return `\n${indent}library ${name} {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        Interface: (block, indent, renderList) => {
            const name = block.data?.name || "ICounter";
            return `\n${indent}interface ${name} {\n` + 
                   renderList(block.children || [], indent + "    ", true) + 
                   `${indent}}\n`;
        },
        Struct: (block, indent) => {
            const name = block.data?.name || "Todo";
            const members = block.data?.members || [];
            return `\n${indent}struct ${name} {\n` + 
                   members.map(m => `${indent}    ${m.type} ${m.name};\n`).join("") + 
                   `\n${indent}}\n`;
        },
        Require: (block, indent) => {
            const cond = block.data?.condition || "true";
            const msg = block.data?.message ? `, "${block.data.message}"` : "";
            return `${indent}require(${cond}${msg});\n`;
        },
        Assert: (block, indent) => {
            const cond = block.data?.condition || "true";
            const msg = block.data?.message ? `, "${block.data.message}"` : "";
            return `${indent}assert(${cond}${msg});\n`;
        },
        Revert: (block, indent) => {
            const msg = block.data?.message || "Error";
            return msg.includes("(") ? `${indent}revert ${msg};\n` : `${indent}revert("${msg}");\n`;
        },
        Event: (block, indent) => {
            const name = block.data?.name || "Log";
            const args = (block.data?.params || []).map(p => `${p.type}${p.indexed ? " indexed" : ""} ${p.name}`).join(", ");
            return `${indent}event ${name}(${args});\n`;
        },
        Emit: (block, indent) => {
            const stmt = block.data?.statement || "Log()";
            return `${indent}emit ${stmt};\n`;
        },
        Receive: (block, indent, renderList) => {
            return `\n${indent}receive() external payable {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        },
        Fallback: (block, indent, renderList) => {
            const mut = block.data?.mutability ? " " + block.data.mutability : "";
            return `\n${indent}fallback() external${mut} {\n` + 
                   renderList(block.children || [], indent + "    ", false) + 
                   `${indent}}\n`;
        }
    };

    const renderList = (blockList, indent = "", isInterface = false) => {
        let output = "";
        for (let idx = 0; idx < blockList.length; idx++) {
            const block = blockList[idx];
            const nextBlock = blockList[idx + 1];
            const followedByElse = nextBlock && (nextBlock.type === 'ElseIf' || nextBlock.type === 'Else');
            
            const transformer = BlockTransformers[block.type];
            if (transformer) {
                output += transformer(block, indent, renderList, isInterface, followedByElse);
            }
        }
        return output;
    };

    return codeSnippet + renderList(blocks, "", false);
};
