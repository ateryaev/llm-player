import { Button } from "./Button";

function Header({ url, model }) {
  return (
    <div className="bg-blue-400 w-full top-0 sticky z-10 pt-2">
      <div className="m-auto p-4 max-w-3xl text-white flex gap-2 items-end">
        <div className="flex-1 px-2">
          {url}
          <br />
          {model}
        </div>
        <Button className={"text-white hover:bg-white/30 focus:bg-white/30"}>config</Button>
      </div>
    </div>)
}
export default Header;

/** 
 *         <div className="p-0 flex flex-col justify-center text-center top-0 sticky z-10
       border-b-0 border-neutral-500 items-start  text-white">
 
           <div className="pt-2 bg-blue-400 w-full flex gap-2 items-center px-2">
             <div className="flex-1 text-left p-2 bg-blue-400">
               <div className='text-xs'>localhost:1234/v1</div>
               <div>Deepseek-v3:latest</div>
             </div>
             <button className="text-blue-300x p-1 bg-white/20  aspect-squarex text-xs xring xrounded-full ring-offset-1">
               [settings]
             </button>
           </div>
           <Dropdown options={options} value={selectedValue} onChange={handleChange} />
         </div >
 
 */