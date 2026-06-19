import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import BottomNavbar from "@/components/structure-components/BottomNavbar";
import { MotionSidebarMenu } from "@/components/structure-components/SIdebarMenu";
import { HomepageContent } from "@/components/page-content/HomepageContent";
import { getLocale } from "next-intl/server";
import {
    homeMessages,
    type SupportedHomeLocale,
} from "@/i18n/homeMessages";

export default async function HomePage() {
    const locale = (await getLocale()) as SupportedHomeLocale;
    const navigationCopy = (homeMessages[locale] ?? homeMessages.en).navigation;
    
    return (
        <section className="flex flex-col">
            <header className="relative">
                <nav>
                    <Navbar affectOpacity={true} copy={navigationCopy}/>
                </nav>
            </header>
            
            <div className="flex flex-col">
                <aside className="hidden md:block relative z-20 flex-grow w-[15%] font-sans">
                    <MotionSidebarMenu
                        variants={{
                            rest: { 
                                x: '-100%', 
                                y: '65px',
                                transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } 
                            },
                            hover: {
                                x: '-2%',
                                y: '65px',
                                transition: { type: 'spring', stiffness: 200, damping: 20} 
                            }
                        }}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        isPopOutSidebar={false}
                        opensOnHover={true}
                        className="fixed w-[15%]"
                        copy={navigationCopy.sidebar}
                    />
                </aside>
                
                <HomepageContent/>
            </div>
          
            {/* <nav>
                <BottomNavbar/>
            </nav> */}
            
            <footer>
                <Footer/>
            </footer>
        </section>
    );
}
