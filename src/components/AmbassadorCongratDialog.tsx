import { useState } from "react";
import { ExternalLink, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { type AmbassadorMilestone } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface AmbassadorCongratDialogProps {
  milestone: AmbassadorMilestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryFormSubmitted: boolean;
}

const AmbassadorCongratDialog = ({
  milestone, open, onOpenChange, deliveryFormSubmitted,
}: AmbassadorCongratDialogProps) => {
  const [formSubmitted, setFormSubmitted] = useState(deliveryFormSubmitted);

  if (!milestone) return null;

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast({ title: "Форма отправлена!", description: "Даша свяжется с тобой в течение 3 дней 🤍" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-secondary/10">
        <DialogHeader className="text-center items-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 animate-pulse">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="font-heading text-2xl">
            Поздравляем! Ты — {milestone.label} ✨
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {milestone.gift_description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {milestone.gift_type === "telegram" && (
            <Button asChild className="h-12 w-full gap-2">
              <a href="https://t.me/+example_invite" target="_blank" rel="noopener noreferrer">
                <Send className="h-4 w-4" />
                Вступить в ТГ-канал
              </a>
            </Button>
          )}

          {milestone.gift_type === "content" && (
            <Button asChild className="h-12 w-full gap-2">
              <a href="/material/3">
                <ExternalLink className="h-4 w-4" />
                Открыть закрытый материал
              </a>
            </Button>
          )}

          {milestone.gift_type === "physical" && (
            <>
              {formSubmitted ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                  <p className="text-sm text-foreground">
                    Форма уже отправлена 🤍
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Даша свяжется с тобой в течение 3 дней
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDeliverySubmit} className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Заполни данные для доставки подарка:
                  </p>
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input required placeholder="Твоё имя" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input required type="tel" placeholder="+7 (999) 123-45-67" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input required type="email" placeholder="email@example.com" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Адрес доставки</Label>
                    <Input required placeholder="Город, улица, дом, квартира" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Индекс</Label>
                    <Input required placeholder="123456" className="h-10" />
                  </div>
                  <Button type="submit" className="h-11 w-full">
                    Отправить
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AmbassadorCongratDialog;
