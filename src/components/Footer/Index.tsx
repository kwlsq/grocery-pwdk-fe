export default function Footer(){
        return (
            <footer className="bg-gray-100 border-t">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Grocereach. All rights reserved.</p>
                    <div className="flex justify-center space-x-6 mt-4">
                        <a href="#" className="hover:text-emerald-600">About Us</a>
                        <a href="#" className="hover:text-emerald-600">Contact</a>
                        <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        );
    };
