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
    <footer className="bg-[#235784] text-white w-full px-6 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {/* Logo & Social Links */}
        <div className="flex flex-col items-center sm:col-span-2 lg:col-span-1">
          <div className="mb-6">
            <Image src="/logo.png" alt="Logo" width={150} height={80} />
          </div>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:opacity-80 transition"><FaFacebook /></a>
            <a href="#" className="hover:opacity-80 transition"><FaTwitter /></a>
            <a href="#" className="hover:opacity-80 transition"><FaYoutube /></a>
            <a href="#" className="hover:opacity-80 transition"><FaInstagram /></a>
          </div>
        </div>

        {/* Column Links */}
        <FooterColumn
          title="Our Destinations"
          links={['Europe', 'Asia', 'Africa', 'North America', 'South America']}
        />
        <FooterColumn
          title="Our Activities"
          links={['Hiking', 'Scuba Diving', 'Safari Tours', 'Cultural Tours', 'Adventure Sports']}
        />
        <FooterColumn
          title="Travel Blogs"
          links={['Travel Tips', 'Destination Guides', 'Travel Stories', 'Photography', 'Travel Resources']}
        />
        <FooterColumn
          title="About Us"
          links={['Our Story', 'Team', 'Careers', 'Partners', 'Press']}
        />
        <FooterColumn
          title="Contact Us"
          links={['Email', 'Phone', 'Address', 'FAQ', 'Support']}
        />
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-white/80">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col items-center text-center">
    <h3 className="text-white mb-6 text-lg font-semibold">{title}</h3>
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
