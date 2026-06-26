"use client";
import Image from "next/image";
import { useState } from "react";

export const Logo = ({width = 120, height = 50, position = "ml-5"} : {width?: number, height?: number, position?: string}) => {
    return (
        <div className={`${position} relative`} style={{width: `${width}px`, height: `${height}px`}}>
            <Image src="/cholobd-logo.png" alt="Cholo BD Logo" fill className="object-contain" />
        </div>
    );
}

export const Logo_old = ({textSize = "md:text-xl lg:text-2xl", position = "ml-5"} : {textSize?: string, position?: string}) => {
    return (
        <div className={`md:w-fit ${position} md:p-4 text-center ${textSize} font-satisfy rounded-sm`} style={{backgroundColor: 'var(--theme-deep-green)', color: 'var(--theme-teal)'}}>
            Cholo BD!
        </div>
    );
}

export const NextImage = ({
    className,
    style,
    priority = false,
    src,
    alt,
    nextImageClassName = "object-cover"
}: {
    className?: string;
    style?: React.CSSProperties;
    priority?: boolean;
    src: string | null;
    alt: string;
    nextImageClassName?: string;
}) => {
    const FALLBACK_SRC = "/404E.jpg";

    const [imgSrc, setImgSrc] = useState<string>(
        src && src.trim() !== "" ? src : FALLBACK_SRC
    );

    return (
        <div className={`relative overflow-hidden ${className}`} style={style}>
            <Image
                className={nextImageClassName}
                src={imgSrc}
                alt={alt}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                onError={() => {
                    setImgSrc(FALLBACK_SRC);
                }}
            />
        </div>
    );
};

export const HorizontalDivider = ({className} : {className?: string}) => {
    return (
        <hr className={`border-t my-4 ${className}`} style={{borderColor: 'var(--theme-deep-green)'}} />
    );
}

export const HorizontalDividerWithText = ({className, children} : {className?: string, children: React.ReactNode}) => {
    return (
        <div className={`flex my-4 items-center ${className}`}>
            <hr className="flex-grow border-t" style={{borderColor: 'var(--theme-deep-green)'}}/>
            <span className="mx-4 theme-text" style={{color: 'var(--theme-text)'}}>{children}</span>
            <hr className="flex-grow border-t" style={{borderColor: 'var(--theme-deep-green)'}}/>  
        </div> 
    );
}

export const VerticalDivider = ({ className = "", height = "h-full" }: {className?: string, height?: string}) => (
  <div className={`border-l ${height} ${className}`} style={{borderColor: 'var(--theme-deep-green)'}} />
);

const DivGap = ({customHeightGap = "h-[50px]"} : {customHeightGap?: string}) => {
    return(
        <div className={`bg-transparent! ${customHeightGap}`}></div>
    );
}

export default DivGap;