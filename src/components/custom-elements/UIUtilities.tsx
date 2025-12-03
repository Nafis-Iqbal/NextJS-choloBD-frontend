import Image from "next/image";

export const Logo = ({textSize = "md:text-xl lg:text-2xl", position = "ml-5"} : {textSize?: string, position?: string}) => {
    return (
        <div className={`md:w-[20%] ${position} md:p-2 text-center bg-[#0F0F0F] ${textSize} text-[#00FF99] font-satisfy rounded-sm`}>
            Suit up!
        </div>
    );
}

export const NextImage = ({
    className, 
    priority = false,
    src, 
    alt, 
    nextImageClassName = "object-cover"
} : {
    className?: string, 
    priority?: boolean,
    src: string | null, 
    alt: string, 
    nextImageClassName?: string
}) => {
    return (
        <div className={`relative ${className}`}>
            <Image 
                className={nextImageClassName} 
                src={src || "/image-not-found.png"} 
                alt={alt} 
                fill
                priority={priority}
            />
        </div>
    )
}

export const HorizontalDivider = ({className} : {className?: string}) => {
    return (
        <hr className={`border-t border-gray-300 my-4 ${className}`} />
    );
}

export const HorizontalDividerWithText = ({className, children} : {className?: string, children: React.ReactNode}) => {
    return (
        <div className={`flex my-4 items-center ${className}`}>
            <hr className="flex-grow border-t border-gray-300"/>
            <span className="mx-4 text-white">{children}</span>
            <hr className="flex-grow border-t border-gray-300"/>  
        </div> 
    );
}

export const VerticalDivider = ({ className = "", height = "h-full" }: {className?: string, height?: string}) => (
  <div className={`border-l border-gray-300 ${height} ${className}`} />
);

const DivGap = ({customHeightGap = "h-[50px]"} : {customHeightGap?: string}) => {
    return(
        <div className={customHeightGap}></div>
    );
}

export default DivGap;