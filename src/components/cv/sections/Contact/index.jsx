
import { Mail, Github, MapPin, Linkedin } from 'lucide-react';

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

const Contact = ({ data }) => {
  if (!data) {
    return null;
  }
  const { email, github, linkedin, location } = data;

  const contactItems = [
    email && { icon: Mail, text: email, href: `mailto:${email}` },
    github && { icon: Github, text: github, href: `https://${github}`, isExternal: true },
    linkedin && { icon: Linkedin, text:  `in/${linkedin.split('/').pop()}`, href: linkedin, isExternal: true },
    location && { icon: MapPin, text: location },
  ].filter(Boolean);

  if (!contactItems.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {contactItems.map((item, index) => (
        <ContactItem key={`contact-${index}-${item.text}`} {...item} />
      ))}
    </div>
  );
};

export default Contact;
