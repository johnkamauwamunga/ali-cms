import { Handshake, Sparkles } from 'lucide-react';
import { SiDocker, SiJavascript, SiNodedotjs, SiPostgresql, SiReact } from '@icons-pack/react-simple-icons';

const simpleIcons = {
  docker: SiDocker,
  javascript: SiJavascript,
  nodedotjs: SiNodedotjs,
  postgresql: SiPostgresql,
  react: SiReact,
};

export default function SkillIcon({ skill, size = 25 }) {
  if (skill.iconSource === 'simple-icons') {
    const Icon = simpleIcons[skill.icon?.toLowerCase()];
    if (Icon) return <Icon size={size} aria-hidden="true" />;
  }
  if (skill.icon === 'handshake') return <Handshake size={size} aria-hidden="true" />;
  return <Sparkles size={size} aria-hidden="true" />;
}
