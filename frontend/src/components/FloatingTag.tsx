import React from 'react';
import {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Activity,
  Award,
  ShieldCheck,
  Users,
  Truck,
  Cpu,
  FlaskConical,
  CheckCircle2,
  Scale,
  Wind,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { FloatingTagData } from '../types';

interface FloatingTagProps {
  tag: FloatingTagData;
  containerWidth: number;
  containerHeight: number;
}

export const FloatingTag: React.FC<FloatingTagProps> = ({
  tag,
  containerWidth,
  containerHeight,
}) => {
  // Render corresponding icon inside circle
  const getIcon = (iconName: string) => {
    const iconProps = { className: 'w-3.5 h-3.5 text-white stroke-[2.2]' };
    switch (iconName) {
      case 'thermometer':
        return <Thermometer {...iconProps} />;
      case 'sun':
        return <Sun {...iconProps} />;
      case 'droplet':
      case 'droplets':
        return <Droplets {...iconProps} />;
      case 'sprout':
        return <Sprout {...iconProps} />;
      case 'activity':
        return <Activity {...iconProps} />;
      case 'award':
        return <Award {...iconProps} />;
      case 'shield-check':
        return <ShieldCheck {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'truck':
        return <Truck {...iconProps} />;
      case 'cpu':
        return <Cpu {...iconProps} />;
      case 'flask-conical':
        return <FlaskConical {...iconProps} />;
      case 'check-circle-2':
        return <CheckCircle2 {...iconProps} />;
      case 'scale':
        return <Scale {...iconProps} />;
      case 'wind':
        return <Wind {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'shopping-bag':
        return <ShoppingBag {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  // Compute exact positions from percentages
  const tagLeft = (tag.tagX / 100) * containerWidth;
  const tagTop = (tag.tagY / 100) * containerHeight;
  const anchorX = (tag.anchorX / 100) * containerWidth;
  const anchorY = (tag.anchorY / 100) * containerHeight;

  const isTagOnLeft = tag.tagX < tag.anchorX;
  const cardConnectionX = isTagOnLeft ? tagLeft + 65 : tagLeft - 65;
  const cardConnectionY = tagTop;

  return (
    <>
      {/* Dynamic SVG Leader Line & Anchor Point */}
      {containerWidth > 0 && containerHeight > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <path
            d={`M ${cardConnectionX} ${cardConnectionY} Q ${(cardConnectionX + anchorX) / 2} ${
              (cardConnectionY + anchorY) / 2
            } ${anchorX} ${anchorY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-80 animate-line-glow"
          />

          {/* Anchor node on the hero plant/subject */}
          <circle cx={anchorX} cy={anchorY} r="3.5" fill="#ffffff" />
          <circle
            cx={anchorX}
            cy={anchorY}
            r="6"
            fill="none"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.2"
            className="animate-ping"
            style={{ transformOrigin: `${anchorX}px ${anchorY}px` }}
          />
        </svg>
      )}

      {/* Floating Glassmorphism Tag matching video pill */}
      <div
        className={`absolute z-20 cursor-default select-none glass-tag px-3 py-1.5 rounded-full flex items-center gap-2 ${
          tag.floatDuration || 'animate-float-1'
        }`}
        style={{
          left: `${tag.tagX}%`,
          top: `${tag.tagY}%`,
          transform: 'translate(-50%, -50%)',
          animationDelay: `${tag.delay || 0}s`,
        }}
      >
        {/* Solid circular colored icon matching video */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
          style={{
            backgroundColor: tag.statusColor || '#22c55e',
          }}
        >
          {getIcon(tag.icon)}
        </div>

        {/* Value and Label text */}
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          <span className="font-semibold text-slate-700">{tag.label}</span>
          <span className="font-extrabold text-slate-950">{tag.value}</span>
        </div>
      </div>
    </>
  );
};
