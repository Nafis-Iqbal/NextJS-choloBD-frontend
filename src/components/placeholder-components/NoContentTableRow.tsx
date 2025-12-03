export const NoContentTableRow = ({displayMessage, tdColSpan} : {displayMessage: string, tdColSpan: number}) => {
    let divColor: string = "blue-300";
    
    if(displayMessage && displayMessage.includes("Error")){
        divColor = "bg-red-300";
    }
    else {
        divColor = "bg-gray-400";
    }
    
    return (
        <div className={`flex justify-center items-center text-center text-black ${divColor}`}>
            <p className="py-2 text-center">  {displayMessage}</p>
        </div>
    )
}