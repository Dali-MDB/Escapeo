import React from 'react';
import Image from 'next/image';
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[var(--primary)] text-white w-full px-6 py-16">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
        {/* Logo + Socials */}
        <div className="flex flex-col items-center sm:items-start justify-center text-center sm:text-left">
          <div className="mb-6">
          <Image src="/logo.png" alt="Logo" width={150} height={80} className="mb-6" />
          </div>
          
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:opacity-80 transition"><FaFacebook /></a>
            <a href="#" className="hover:opacity-80 transition"><FaTwitter /></a>
            <a href="#" className="hover:opacity-80 transition"><FaYoutube /></a>
            <a href="#" className="hover:opacity-80 transition"><FaInstagram /></a>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-4 gap-8  sm:grid-cols-5 w-full">
          <FooterColumn
            title="Our Destinations"
            links={['Europe', 'Asia', 'Africa', 'North America', 'South America']}
            textClass="text-xs sm:text-base "
          />
          <FooterColumn
            title="Our Activities"
            links={['Hiking', 'Scuba Diving', 'Safari Tours', 'Cultural Tours', 'Adventure Sports']}
            textClass="text-xs sm:text-base "
          />
          <div className="hidden sm:block">
            <FooterColumn
              title="Travel Blogs"
              links={['Travel Tips', 'Destination Guides', 'Travel Stories', 'Photography', 'Travel Resources']}
              textClass="text-xs sm:text-base"
            />
          </div>
          <FooterColumn
            title="About Us"
            links={['OurStory', 'Team', 'Careers', 'Partners', 'Press']}
            textClass="text-xs sm:text-base "
          />
          <FooterColumn
            title="Contact Us"
            links={['Email', 'Phone', 'Address', 'FAQ', 'Support']}
            textClass="text-xs sm:text-base "
          />
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <p className="text-xs sm:text-sm text-white/80">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
    <h3 className="text-white mb-6 text-sm sm:text-lg font-semibold">{title}</h3>
    <ul className="space-y-2">
      {links.map((link, idx) => (
        <li key={idx}>
          <a
            href="#"
            className="text-white/80 hover:text-white transition"
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
