import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock } from "lucide-react";

interface SessionCardProps {
  session: {
    id: string;
    device: string;
    browser: string;
    os: string;
    location: string;
    ip: string;
    createdAt: string;
    expiresAt: string;
  };
}

const getDeviceIcon = (device: string) => {
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (deviceLower.includes('tablet')) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSessionActive = (expiresAt: string) => {
  return new Date(expiresAt) > new Date();
};

export const SessionCard = ({ session }: SessionCardProps) => {
  const isActive = isSessionActive(session.expiresAt);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getDeviceIcon(session.device)}
            <span className="font-medium">{session.device}</span>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Expirée"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>{session.browser} • {session.os}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{session.location} • {session.ip}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Créée le {formatDate(session.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
};