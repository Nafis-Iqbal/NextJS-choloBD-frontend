import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import BottomNavbar from "@/components/structure-components/BottomNavbar";
import {MotionSidebarMenu} from "@/components/structure-components/SIdebarMenu";
import DivGap from "@/components/custom-elements/UIUtilities";

export default function InfoPageLayout({children} : {children: React.ReactNode}){

    return (
        <section className="flex flex-col min-h-screen">
            <header className="relative">
                <nav>
                    <Navbar/>
                </nav>
            </header>

            <DivGap customHeightGap="h-[55px] md:h-[70px]"/>
            
            <div className="flex justify-between border min-h-screen">
                <aside className="hidden md:block relative z-10 flex-grow w-[15%] font-sans">
                    <MotionSidebarMenu
                        variants={{
                            rest: { x: '-100%', transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } },
                            hover: { x: '-2%', transition: { type: 'spring', stiffness: 200, damping: 20} }
                        }}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        isPopOutSidebar={false}
                        opensOnHover={true}
                        className="fixed w-[15%]"
                    />
                </aside>
                
                <div className="flex flex-col flex-grow w-full md:w-[70%]">
                    {children}
                </div>

                <aside className="hidden md:block relative z-10 flex-grow w-[15%]">
                    
                </aside>
            </div>
            
            <nav>
                <BottomNavbar/>
            </nav>
            
            <footer>
                <Footer/>
            </footer>
        </section>
    )
}