import { Github, Linkedin } from "lucide-react"
import { NextImage } from "../custom-elements/UIUtilities"

export const AboutSection = ({className} : {className?: string}) => {
    return (
        <div className="w-full sm:w-[50%] mr-10 bg-inherit px-6 py-8">
            <div className="max-w-full bg-gray-900 rounded-2xl p-6 shadow-2xl font-sans">
                <div className="flex flex-col rounded-md p-2 lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Profile Picture */}
                    <div className="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0">
                        <NextImage
                            src="/DP.jpg"
                            alt="Developer Profile"
                            className="w-24 h-24 lg:w-32 lg:h-32"
                            nextImageClassName="rounded-full object-cover border-4 border-[#00FF99] shadow-lg"
                        />
                    </div>
                    
                    {/* Developer Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <p className="text-xs lg:text-sm text-gray-400 mb-1">Developed by</p>
                        <h3 className="text-xl lg:text-2xl font-bold text-[#00FF99] mb-2">Nafis Iqbal</h3>
                        <h4 className="text-sm lg:text-lg font-semibold text-gray-300 mb-3">Full Stack Developer, Unity Game Developer, and Tech Enthusiast</h4>
                        <p className="text-gray-300 text-xs lg:text-sm leading-relaxed mb-4">
                            Experienced game developer with expertise in Unity and modern web technologies including Express.js, Next.js, React, and Laravel. 
                            Currently expanding into AI and machine learning while pursuing advanced studies in MLOps and AI Engineering. 
                            Dedicated to creating scalable solutions and innovative digital experiences.
                        </p>
                        
                        {/* Social Links & Contact */}
                        <div className="flex justify-center lg:justify-start items-center space-x-6">
                            <a
                                href="https://github.com/Nafis-Iqbal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00FF99] hover:text-white transition duration-300 transform hover:scale-110"
                                title="GitHub Profile"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/nafis-iqbal-79b645213/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00FF99] hover:text-white transition duration-300 transform hover:scale-110"
                                title="LinkedIn Profile"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a 
                                className="text-[#00FF99] hover:text-white font-medium text-sm transition duration-300" 
                                href="mailto:nafis@example.com"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}