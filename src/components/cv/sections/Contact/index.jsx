import React from 'react';
import { Mail, Github, MapPin, UserRound } from 'lucide-react';
import Section from '../../../../components/common/layout/Section';

const ContactItem = ({ icon: Icon, text, href, isExternal }) => {
  const linkProps = isExternal 
    ? { target: "_blank", rel: "noopener noreferrer" } 
    : {};

  const textClasses = "text-gray-600 dark:text-gray-100 visited:text-purple-700 dark:visited:text-purple-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors";

  return (
    <div className="flex items-center space-x-2 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
      {href ? (
        <a href={href} className={textClasses} {...linkProps}>
          {text}
        </a>
      ) : (
        <span className={textClasses}>{text}</span>
      )}
    </div>
  );
};

const Contact = ({ email, github, location }) => {
  const contactItems = [
    { icon: Mail, text: email, href: `mailto:${email}` },
    { icon: Github, text: github, href: `https://${github}`, isExternal: true },
    { icon: MapPin, text: location },
  ];

  return (
    <Section icon={UserRound} title="Contacto" variant="sidebar" className="mb-8">
      <div className="space-y-3">
        {contactItems.map((item, index) => (
          <ContactItem key={index} {...item} />
        ))}
      </div>
    </Section>
  );
};

export default Contact;