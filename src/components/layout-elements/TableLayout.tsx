const TableLayout = ({children, className} : {children: React.ReactNode, className?: string}) => {
    return (
        <div className={`flex flex-col theme-outline ${className}`}>
            {children}
        </div>
    )
}

export default TableLayout;