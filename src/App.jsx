import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Palette from "./components/Palette";
import Workspace from "./components/Workspace";
import CodePanel from "./components/CodePanel";
import { DndContext, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { generateSolidity as getSolidity } from "./utils/solidityGenerator";

// Persistent worker instance to keep library cache across compilations
// Setting this outside the component prevents the worker from being destroyed
// and recreated every time App re-renders, keeping the CDN cache hot.
let compilerWorker = null;

function App() {
   const [blocks, setBlocks] = useState([]);
   const [isCodeOpen, setIsCodeOpen] = useState(true);
   const [isFullscreenCode, setIsFullscreenCode] = useState(false);
   const [generatedCode, setGeneratedCode] = useState("");
   const [solVersion, setSolVersion] = useState("^0.8.0");
   const [ethPrice, setEthPrice] = useState("---");
   const [gasPrice, setGasPrice] = useState("---");
   const [compilationResult, setCompilationResult] = useState(null);
   const [isCompiling, setIsCompiling] = useState(false);

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

      // Guard against browser URL limits (typically safe up to ~2000-8000 max chars)
      // If a contract is massive, the base64 string will just get truncated silently by the browser.
      if (b64.length > 7000) {
         alert("Contract is too large to export via URL. Please copy the code directly to Remix.");
         return;
      }

      window.open(`https://remix.ethereum.org/#code=${b64}`, "_blank");
   };

    const handleCompile = () => {
       if (isCompiling) return;
       setIsCompiling(true);
       setCompilationResult(null);

       // Initialize worker if needed
       if (!compilerWorker) {
          compilerWorker = new Worker(new URL('./utils/compiler-worker.js', import.meta.url));
       }
       
       compilerWorker.postMessage({ sourceCode: generatedCode });

       compilerWorker.onmessage = (e) => {
          const { success, output, error } = e.data;
          if (success) {
             setCompilationResult(output);
          } else {
             setCompilationResult({ errors: [{ severity: 'error', message: error, type: 'Internal' }] });
          }
          setIsCompiling(false);
       };

       compilerWorker.onerror = (e) => {
          setCompilationResult({ errors: [{ severity: 'error', message: "Compiler worker failed to load. Check console.", type: 'System' }] });
          setIsCompiling(false);
       };
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

      /**
       * Recursively traverses the nested array to find a block by ID,
       * removes it from its parent's array, and returns the removed block.
       */
      const findAndRemove = (list, id) => {
         for (let i = 0; i < list.length; i++) {
            if (String(list[i].id) === id) return list.splice(i, 1)[0];
            if (list[i].children) {
               const found = findAndRemove(list[i].children, id);
               if (found) return found;
            }
         }
      };

      /**
       * Recursively searches for a block by ID and returns its parent array
       * and its index within that array (used for dropping "before" another block).
       */
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

      /**
       * Simple recursive search to fetch a block reference by ID 
       * (used to find the target container when dropping inside a block).
       */
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
   };

   const generateSolidity = () => {
      setGeneratedCode(getSolidity(blocks, solVersion));
   };

   useEffect(() => {
      generateSolidity();
   }, [blocks, solVersion]);

   /**
    * Injects a new block into the root of the workspace.
    * Uses a switch statement to populate `initialData` with safe defaults 
    * so the block renders immediately without crashing.
    */
   const addBlock = (type) => {
      let initialData = { isOpen: true };
      
      switch (type) {
         case 'Contract':
            initialData.name = "MyContract";
            break;
         case 'Function':
            initialData.name = "myFunc";
            break;
         case 'State Var':
            initialData.name = "newVar";
            break;
         case 'Mapping':
            initialData.name = "myMap";
            initialData.types = ["address", "uint256"]; // New array structure
            initialData.visibility = "public";
            break;
         case 'While':
            initialData.condition = "true";
            break;
         case 'For':
            initialData.init = "uint256 i = 0";
            initialData.condition = "i < 10";
            initialData.step = "i++";
            break;
         case 'If':
         case 'ElseIf':
            initialData.condition = "x < 10";
            break;
         case 'Ternary':
            initialData.condition = "_x < 10";
            initialData.trueVal = "1";
            initialData.falseVal = "2";
            break;
         case 'Array':
            initialData.itemType = "uint256";
            initialData.fixedSize = ""; // dynamic by default
            initialData.name = "arr";
            break;
         case 'Enum':
            initialData.name = "Status";
            initialData.members = ["Pending", "Shipped"];
            break;
         case 'Library':
            initialData.name = "MyLibrary";
            break;
         case 'User-Defined Value Type':
            initialData.name = "Duration";
            initialData.subType = "uint64";
            break;
         case 'Struct':
            initialData.name = "Todo";
            initialData.members = [{ type: "string", name: "text" }, { type: "bool", name: "completed" }];
            break;
         case 'ErrorDef':
            initialData.name = "MyError";
            initialData.params = [{ type: 'uint256', name: '_balance' }];
            break;
         case 'Require':
         case 'Assert':
            initialData.condition = "x > 0";
            initialData.message = ""; // Start with empty message
            break;
         case 'Revert':
            initialData.message = "Error"; // Default error string
            break;
         case 'Event':
            initialData.name = "Transfer";
            initialData.params = [{ type: 'address', name: 'from', indexed: true }];
            break;
         case 'Emit':
            initialData.statement = "Transfer(msg.sender, 100)";
            break;
         case 'Interface':
            initialData.name = "ICounter";
            break;
         case 'Receive':
            initialData.isOpen = true; // Always payable
            break;
         case 'Fallback':
            initialData.mutability = 'payable';
            break;
         default:
            break;
      }

      // ═══════ TEMPLATES ═══════
      // Templates aren't single primitives; they are pre-assembled nested 
      // trees of blocks injected all at once. Like dropping a prefab.
      if (type === 'ERC20 Token') {
         const tId = Date.now();
         const newBlock = {
            id: `block-${tId}`,
            type: 'Contract',
            data: { name: "MyToken", inheritance: "ERC20", isOpen: true },
            children: [
               { id: `block-${tId}-1`, type: 'Constructor', data: { name: "constructor", params: [], initializers: " ERC20(\"MyToken\", \"MTK\")" }, children: [
                  { id: `block-${tId}-2`, type: 'Logic', data: { code: "_mint(msg.sender, 1000 * 10**18);" } }
               ]},
               { id: `block-${tId}-3`, type: 'Function', data: { name: "mint", visibility: "public", params: [{type: 'address', name: 'to'}, {type: 'uint256', name: 'amount'}] }, children: [
                  { id: `block-${tId}-4`, type: 'Logic', data: { code: "_mint(to, amount);" } }
               ]}
            ]
         };
         setBlocks([...blocks, newBlock]);
         return;
      }

      if (type === 'ERC721 NFT') {
         const tId = Date.now();
         const newBlock = {
            id: `block-${tId}`,
            type: 'Contract',
            data: { name: "MyNFT", inheritance: "ERC721", isOpen: true },
            children: [
               { id: `block-${tId}-1`, type: 'Constructor', data: { name: "constructor", initializers: " ERC721(\"MyNFT\", \"NFT\")" }, children: [
                  { id: `block-${tId}-2`, type: 'Logic', data: { code: "// Initial setup" } }
               ]},
               { id: `block-${tId}-3`, type: 'Function', data: { name: "safeMint", visibility: "public", params: [{type: 'address', name: 'to'}, {type: 'uint256', name: 'tokenId'}] }, children: [
                  { id: `block-${tId}-4`, type: 'Logic', data: { code: "_safeMint(to, tokenId);" } }
               ]}
            ]
         };
         setBlocks([...blocks, newBlock]);
         return;
      }

      if (type === 'Ownable') {
         const tId = Date.now();
         const newBlock = {
            id: `block-${tId}`,
            type: 'Contract',
            data: { name: "RestrictedContract", inheritance: "Ownable", isOpen: true },
            children: [
               { id: `block-${tId}-1`, type: 'Function', data: { name: "withdraw", visibility: "public", modifiers: "onlyOwner" }, children: [
                  { id: `block-${tId}-2`, type: 'Logic', data: { code: "payable(owner()).transfer(address(this).balance);" } }
               ]}
            ]
         };
         setBlocks([...blocks, newBlock]);
         return;
      }

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
         <Sidebar 
            onToggleFullscreen={() => setIsFullscreenCode(!isFullscreenCode)} 
         />

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

         <div className={`transition-all duration-500 border-l border-gray-800 bg-[#050505] overflow-hidden flex flex-col
                       ${isFullscreenCode ? 'flex-1' : (isCodeOpen ? 'w-[450px]' : 'w-0')}`}>
            <CodePanel 
               code={generatedCode} 
               onExport={handleOpenInRemix} 
               onCompile={handleCompile}
               compilationResult={compilationResult}
               isCompiling={isCompiling}
            />
         </div>

      </div>
   )
}

export default App
