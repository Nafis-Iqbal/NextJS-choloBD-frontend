const FilterSectionLayout = ({children, className, onSubmit} : {children: React.ReactNode, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, className?: string,}) => {
    return (
        <form className={`flex flex-col mt-6 space-y-3 ${className}`} onSubmit={onSubmit}>
            <h4 className="text-green-500">Filters</h4>
            {children}
        </form>
    )
}

export default FilterSectionLayout;