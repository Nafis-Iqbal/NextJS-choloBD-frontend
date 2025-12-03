const TableLayout = ({children, className} : {children: React.ReactNode, className?: string}) => {
    return (
        <div className={`flex flex-col border-[0.5px] border-green-900 ${className}`}>
            {children}
        </div>
    )
}

export default TableLayout;