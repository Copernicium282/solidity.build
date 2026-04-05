import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Palette from "./components/Palette";
import Workspace from "./components/Workspace";
import CodePanel from "./components/CodePanel";
import { DndContext, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

function App() {
   const [blocks, setBlocks] = useState([]);
   const [isCodeOpen, setIsCodeOpen] = useState(true);
   const [isFullscreenCode, setIsFullscreenCode] = useState(false);
   const [generatedCode, setGeneratedCode] = useState("");
   const [solVersion, setSolVersion] = useState("^0.8.30");
   const [ethPrice, setEthPrice] = useState("---");
   const [gasPrice, setGasPrice] = useState("---");

   useEffect(() => {
      const fetchPrices = async () => {
         try {
            // CoinGecko ETH Price with Demo API Key
            const cgKey = import.meta.env.VITE_COINGECKO_API_KEY || "";
            const ethRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd${cgKey ? `&x_cg_demo_api_key=${cgKey}` : ''}`);
            const ethData = await ethRes.json();
            if (ethData.ethereum?.usd) {
               setEthPrice(`$${ethData.ethereum.usd.toLocaleString()}`);
            }

            // Etherscan Gas Tracker with V2 API Key
            const etherscanKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
            if (etherscanKey) {
               const gasRes = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${etherscanKey}`);
               const gasData = await gasRes.json();
               if (gasData.result?.ProposeGasPrice) {
                  // Normalize if a long decimal
                  const price = parseFloat(gasData.result.ProposeGasPrice);
                  setGasPrice(`${price < 1 ? price.toFixed(2) : Math.round(price)} Gwei`);
               }
            }
         } catch (e) {
            console.error("Price fetch failed", e);
         }
      };

      fetchPrices();
      const interval = setInterval(fetchPrices, 60000); // Update every minute
      return () => clearInterval(interval);
   }, []);

   const handleOpenInRemix = () => {
      // Base64 encode Unicode strings for remix
      const bytes = new TextEncoder().encode(generatedCode);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      const b64 = btoa(binString);

      window.open(`https://remix.ethereum.org/#code=${b64}`, "_blank");
   };

   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
   );

   const handleDragEnd = (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Clone tree
      const newBlocks = structuredClone(blocks);

      // Remove from current position
      const findAndRemove = (list, id) => {
         for (let i = 0; i < list.length; i++) {
            if (String(list[i].id) === id) return list.splice(i, 1)[0];
            if (list[i].children) {
               const found = findAndRemove(list[i].children, id);
               if (found) return found;
            }
         }
      };

      // Find a block's parent list and index
      const findBlockLocation = (list, id) => {
         for (let i = 0; i < list.length; i++) {
            if (String(list[i].id) === id) return { parent: list, index: i };
            if (list[i].children) {
               const found = findBlockLocation(list[i].children, id);
               if (found) return found;
            }
         }
         return null;
      };

      // Find a block by ID
      const findBlock = (list, id) => {
         for (const b of list) {
            if (String(b.id) === id) return b;
            if (b.children) {
               const found = findBlock(b.children, id);
               if (found) return found;
            }
         }
         return null;
      };

      const snatched = findAndRemove(newBlocks, activeId);
      if (!snatched) return;

      // Determine where to insert
      if (overId === 'workspace-drop') {
         // Dropped on empty workspace — add to root
         newBlocks.push(snatched);
      } else if (overId.startsWith('drop-')) {
         // Dropped on a container's drop zone — insert as child
         const parentId = overId.slice(5);
         const parent = findBlock(newBlocks, parentId);
         if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(snatched);
         } else {
            newBlocks.push(snatched);
         }
      } else {
         // Dropped on another block — insert before it
         const location = findBlockLocation(newBlocks, overId);
         if (location) {
            location.parent.splice(location.index, 0, snatched);
         } else {
            newBlocks.push(snatched);
         }
      }

      setBlocks(newBlocks);
      console.log("DROP:", activeId, "→", overId);
   };

   const generateSolidity = () => {
      let code = "// SPDX-License-Identifier: MIT\n";
      code += `pragma solidity ${solVersion};\n\n`;
      const renderList = (blockList, indent = "", isInterface = false) => {
         let output = "";
         blockList.forEach((b, idx) => {
            const nextBlock = blockList[idx + 1];
            const followedByElse = nextBlock && (nextBlock.type === 'ElseIf' || nextBlock.type === 'Else');
            // Contract
            if (b.type === "Contract") {
               const inherits = b.data?.inheritance ? ` is ${b.data.inheritance}` : "";
               output += `${indent}contract ${b.data?.name || "MyContract"}${inherits} {\n`;
               output += renderList(b.children || [], indent + "    "); // recursion
               output += `${indent}}\n\n`;
            }
            // Function
            else if (b.type === "Function") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               const vis = b.data?.visibility || "public";
               const mut = b.data?.mutability ? ` ${b.data.mutability}` : "";
               const virt = b.data?.isVirtual ? " virtual" : "";

               // Handle override and multiple overrides
               let over = "";
               if (b.data?.isOverride) {
                  over = b.data.overrideParents ? ` override${b.data.overrideParents}` : " override";
               }

               const mods = b.data?.modifiers ? ` ${b.data.modifiers}` : "";
               const ret = b.data?.returns ? ` returns (${b.data.returns})` : "";

               // Open the function
               if (isInterface) {
                  output += `\n${indent}function ${b.data?.name || "func"}(${args}) ${vis}${mut}${virt}${over}${mods}${ret};\n`;
               } else {
                  output += `\n${indent}function ${b.data?.name || "func"}(${args}) ${vis}${mut}${virt}${over}${mods}${ret} {\n`;
                  // Call the kids recurser lol
                  output += renderList(b.children || [], indent + "    ");
                  // Close the function
                  output += `${indent}}\n`;
               }
            }
            // Logic
            else if (b.type === "Logic") {
               const codeSnippet = b.data?.code || "";
               // Indent every line of the snippet correctly
               output += codeSnippet.split('\n').map(l => `${indent}${l}`).join('\n') + "\n";
            }
            // State Var
            else if (b.type === "State Var") {
               const baseType = b.data?.isCustomType ? (b.data?.customType || "Status") : (b.data?.varType || "uint256");
               const vis = b.data?.visibility || "public";
               const isConst = b.data?.isConst ? "constant" : "";
               const isImm = b.data?.isImm ? "immutable" : "";
               const modifiers = [isConst, isImm].filter(Boolean).join(" ");
               const modSpacer = modifiers ? ` ${modifiers}` : "";

               // Uppercase name if constant
               const name = b.data?.name || "v";
               let finalName = b.data?.isConst ? name.toUpperCase() : name;
               if (b.data?.isImm) {
                  finalName = `i_${finalName}`;
               }

               const val = b.data?.value ? ` = ${b.data.value}` : "";
               output += `${indent}${baseType} ${vis}${modSpacer} ${finalName}${val};\n`;
            }
            // Mapping
            else if (b.type === "Mapping") {
               const types = b.data?.types || ["address", "uint256"];
               const vis = b.data?.visibility || "public";
               const name = b.data?.name || "myMap";

               // Recursively build if required: mapping(k => mapping(k2 => v))
               const buildMapping = (typeList) => {
                  if (typeList.length <= 1) return typeList[0];
                  const [current, ...rest] = typeList;
                  return `mapping(${current} => ${buildMapping(rest)})`;
               };

               output += `${indent}${buildMapping(types)} ${vis} ${name};\n`;
            }
            // Comment
            else if (b.type === "Comment") {
               const text = b.data?.text || "comment here";
               const commentLineStyle = text.split('\n').map(l => `${indent}    ${l}`).join('\n');
               output += `\n${indent}/*\n${commentLineStyle}\n${indent}*/\n`;
            }
            // Constructor
            else if (b.type === "Constructor") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               const mut = b.data?.mutability ? ` ${b.data.mutability}` : "";
               const inits = b.data?.initializers ? ` ${b.data.initializers}` : "";
               output += `\n${indent}constructor(${args})${mut}${inits} {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // Modifier
            else if (b.type === "Modifier") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               output += `\n${indent}modifier ${b.data?.name || "mod"}(${args}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // While Loop
            else if (b.type === "While") {
               output += `\n${indent}while (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // For Loop
            else if (b.type === "For") {
               const init = b.data?.init || "uint256 i = 0";
               const cond = b.data?.condition || "i < 10";
               const step = b.data?.step || "i++";
               output += `\n${indent}for (${init}; ${cond}; ${step}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // If
            else if (b.type === "If") {
               output += `${indent}if (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}`;
               if (!followedByElse) output += `\n`;
            }
            // ElseIf
            else if (b.type === "ElseIf") {
               output += ` else if (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}`;
               if (!followedByElse) output += `\n`;
            }
            // Else
            else if (b.type === "Else") {
               output += ` else {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // Ternary
            else if (b.type === "Ternary") {
               const cond = b.data?.condition || "_x < 10";
               const t = b.data?.trueVal || "1";
               const f = b.data?.falseVal || "2";
               output += `${indent}return ${cond} ? ${t} : ${f};\n`;
            }
            // Array
            else if (b.type === "Array") {
               const baseType = b.data?.isCustomType ? (b.data?.customType || "Status") : (b.data?.itemType || "uint256");
               const size = b.data?.fixedSize || ""; // dynamic if empty
               const vis = b.data?.visibility || "public";
               const name = b.data?.name || "arr";
               const val = b.data?.value ? ` = ${b.data.value}` : "";

               output += `${indent}${baseType}[${size}] ${vis} ${name}${val};\n`;
            }
            else if (b.type === "Enum") {
               const members = b.data?.members || ["Pending", "Shipped"];
               output += `${indent}enum ${b.data?.name || "Status"} {\n`;
               output += members.map(m => `${indent}    ${m}`).join(",\n");
               output += `\n${indent}}\n\n`;
            }
            // Library
            else if (b.type === "Library") {
               output += `\n${indent}library ${b.data?.name || "MyLibrary"} {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // User-Defined Value Types
            else if (b.type === "User-Defined Value Type") {
               const name = b.data?.name || "Duration";
               const sub = b.data?.subType || "uint64";
               output += `${indent}type ${name} is ${sub};\n`;
            }
            // Struct
            else if (b.type === "Struct") {
               const name = b.data?.name || "Todo";
               const members = b.data?.members || [{ type: "string", name: "text" }];

               output += `\n${indent}struct ${name} {\n`;
               output += members.map(m => `${indent}    ${m.type} ${m.name};`).join("\n");
               output += `\n${indent}}\n`;
            }
            // Error Definition (Custom Error)
            else if (b.type === "ErrorDef") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               output += `${indent}error ${b.data?.name || "MyError"}(${args});\n`;
            }
            // 1. Require
            else if (b.type === "Require") {
               const msg = b.data?.message ? `, "${b.data.message}"` : "";
               output += `${indent}require(${b.data?.condition || "true"}${msg});\n`;
            }
            // 2. Assert
            else if (b.type === "Assert") {
               const msg = b.data?.message ? `, "${b.data.message}"` : "";
               output += `${indent}assert(${b.data?.condition || "true"}${msg});\n`;
            }
            // 3. Revert
            else if (b.type === "Revert") {
               const rawMsg = b.data?.message || "Error";
               if (rawMsg.includes('(')) {
                  // Custom error syntax: revert CustomError();
                  output += `${indent}revert ${rawMsg};\n`;
               } else {
                  // String syntax: revert("String");
                  output += `${indent}revert("${rawMsg}");\n`;
               }
            }
            // Event 
            else if (b.type === "Event") {
               // b.data.params: [{ type: 'address', name: 'sender', indexed: true }]
               const args = (b.data?.params || []).map(p =>
                  `${p.type}${p.indexed ? ' indexed' : ''} ${p.name}`
               ).join(", ");
               output += `${indent}event ${b.data?.name || "Log"}(${args});\n`;
            }
            // Emit Operation
            else if (b.type === "Emit") {
               output += `${indent}emit ${b.data?.statement || "Log()"};\n`;
            }
            // Interface
            else if (b.type === "Interface") {
               output += `\n${indent}interface ${b.data?.name || "ICounter"} {\n`;
               output += renderList(b.children || [], indent + "    ", true); // Pass isInterface = true
               output += `${indent}}\n`;
            }
            // Receive
            else if (b.type === "Receive") {
               output += `\n${indent}receive() external payable {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // Fallback
            else if (b.type === "Fallback") {
               const mut = b.data?.mutability ? ` ${b.data.mutability}` : "";
               output += `\n${indent}fallback() external${mut} {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
         });
         return output;
      };
      const finalBody = renderList(blocks);
      setGeneratedCode(code + finalBody);
   };
   useEffect(() => {
      generateSolidity();
   }, [blocks, solVersion]);

   const addBlock = (type) => {
      let initialData = { isOpen: true };
      if (type === 'Contract') initialData.name = "MyContract";
      else if (type === 'Function') initialData.name = "myFunc";
      else if (type === 'State Var') initialData.name = "newVar";
      else if (type === 'Mapping') {
         initialData.name = "myMap";
         initialData.types = ["address", "uint256"]; // New array structure
         initialData.visibility = "public";
      }
      else if (type === 'While') {
         initialData.condition = "true";
      }
      else if (type === 'For') {
         initialData.init = "uint256 i = 0";
         initialData.condition = "i < 10";
         initialData.step = "i++";
      }
      else if (type === 'If' || type === 'ElseIf') initialData.condition = "x < 10";
      else if (type === 'Ternary') {
         initialData.condition = "_x < 10";
         initialData.trueVal = "1";
         initialData.falseVal = "2";
      }
      else if (type === 'Array') {
         initialData.itemType = "uint256";
         initialData.fixedSize = ""; // dynamic by default
         initialData.name = "arr";
      }
      else if (type === 'Enum') {
         initialData.name = "Status";
         initialData.members = ["Pending", "Shipped"];
      }
      else if (type === 'Library') initialData.name = "MyLibrary";
      else if (type === 'User-Defined Value Type') {
         initialData.name = "Duration";
         initialData.subType = "uint64";
      }
      else if (type === 'Struct') {
         initialData.name = "Todo";
         initialData.members = [{ type: "string", name: "text" }, { type: "bool", name: "completed" }];
      }
      else if (type === 'ErrorDef') {
         initialData.name = "MyError";
         initialData.params = [{ type: 'uint256', name: '_balance' }];
      }
      else if (type === 'Require' || type === 'Assert') {
         initialData.condition = "x > 0";
         initialData.message = ""; // Start with empty message
      }
      else if (type === 'Revert') {
         initialData.message = "Error"; // Default error string
      }
      else if (type === 'Event') {
         initialData.name = "Transfer";
         initialData.params = [{ type: 'address', name: 'from', indexed: true }];
      }
      else if (type === 'Emit') {
         initialData.statement = "Transfer(msg.sender, 100)";
      }
      else if (type === 'Interface') initialData.name = "ICounter";
      else if (type === 'Receive') initialData.isOpen = true; // Always payable
      else if (type === 'Fallback') initialData.mutability = 'payable';
      const newBlock = {
         id: `block-${Date.now()}`,
         type,
         data: initialData,
         children: []
      };
      setBlocks([...blocks, newBlock]);
   };

   const updateBlock = (id, newData) => {
      const walk = (list) =>
         list.map(b => {
            // surface-level check
            if (b.id === id) return { ...b, data: { ...b.data, ...newData } };
            // Check the kids. (lmao)
            if (b.children) return { ...b, children: walk(b.children) };
            return b;
         });
      setBlocks(walk(blocks));
   };

   const removeBlock = (id) => {
      const walk = (list) =>
         list.filter(b => b.id !== id) // Remove if match
            .map(b => b.children ? { ...b, children: walk(b.children) } : b); // Recurse
      setBlocks(walk(blocks));
   };

   return (
      <div className="flex h-screen bg-background text-white overflow-hidden font-sans select-none">
         <Sidebar ethPrice={ethPrice} onToggleFullscreen={() => setIsFullscreenCode(!isFullscreenCode)} />

         <div className={`transition-all duration-300 border-r border-gray-800 flex flex-col bg-[#0b0b0b] min-w-0
                       ${isFullscreenCode ? 'w-0 opacity-0' : 'w-68 opacity-100'}`}>
            <Palette onAddBlock={addBlock} />
         </div>

         <div className={`transition-all duration-300 flex flex-col bg-[#111] min-w-0
                       ${isFullscreenCode ? 'w-0 flex-0 opacity-0' : 'flex-1 opacity-100'}`}>
            <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
               <Workspace
                  blocks={blocks}
                  ethPrice={ethPrice}
                  gasPrice={gasPrice}
                  onUpdateBlock={updateBlock}
                  onRemoveBlock={removeBlock}
                  isCodeOpen={isCodeOpen}
                  solVersion={solVersion}
                  setSolVersion={setSolVersion}
                  onToggleCode={() => setIsCodeOpen(!isCodeOpen)}
                  onOpenInRemix={handleOpenInRemix}
               />
            </DndContext>
         </div>

         {/* Code Panel */}
         <div className={`transition-all duration-500 border-l border-gray-800 bg-[#050505] overflow-hidden flex flex-col
                       ${isFullscreenCode ? 'flex-1' : (isCodeOpen ? 'w-[450px]' : 'w-0')}`}>
            <CodePanel code={generatedCode} onExport={handleOpenInRemix} />
         </div>
      </div>
   )
}

export default App
