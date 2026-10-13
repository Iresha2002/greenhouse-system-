export interface FloatingTagData {
  id: string;
  label: string;
  value: string;
  status: string;
  statusColor?: string; // e.g. emerald, amber, cyan, yellow
  icon: string; // 'thermometer' | 'droplet' | 'sprout' | 'sun' | 'activity' | 'shield' | 'truck' | 'zap' | 'cpu'
  // Position relative to the hero visual container (percentages 0-100)
  tagX: number; // card position %
  tagY: number;
  anchorX: number; // target point on the greenhouse/plant %
  anchorY: number;
  delay?: number; // float delay in seconds
  floatDuration?: string; // animation speed
}

export interface BottomCardData {
  id: string;
  title: string;
  badge: string;
  description: string;
  metric: string;
  icon: string;
  imageThumbnail: string;
}

export interface SlideData {
  id: string;
  categoryBadge: string;
  headline: string;
  subheadline: string;
  description: string;
  tagline: string;
  image: string;
  accentColor: string;
  floatingTags: FloatingTagData[];
  bottomCard: BottomCardData;
}
