export default function NumberCards({className} : {className: string}) {
  return (<div className={"bg-white dark:bg-boxdark shadow-default flex flex-col" + " "+ className}>
    <div className="flex justify-between">
      <h3>Fall</h3>
      <input type="checkbox" name="fall" id="fall" />
    </div>
    <div className="flex justify-center items-center">
      <span>
        10
      </span>
    </div>


  </div>)
}