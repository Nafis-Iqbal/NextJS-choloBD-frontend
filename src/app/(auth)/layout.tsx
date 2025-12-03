export default function AuthLayout({children} : {children: React.ReactNode}){
    return (
        <section className="flex flex-col justify-center items-center min-h-screen md:border-x-4 bg-gray-800 md:bg-black">
            {children}
        </section>
    )
}