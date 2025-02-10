import { t } from "@lingui/macro";
import {
  CopySimple,
  FolderOpen,
  Lock,
  LockOpen,
  PencilSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import type { PortfolioDto } from "@reactive-resume/dto";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";

import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./base-card";

type Props = {
  portfolio: PortfolioDto;
};

export const PortfolioCard = ({ portfolio }: Props) => {
  const navigate = useNavigate();
  const { open } = useDialog<PortfolioDto>("portfolio");
  const { open: lockOpen } = useDialog<PortfolioDto>("lock");

  const template = portfolio.data.data.template;
  const lastUpdated = dayjs().to(portfolio.updatedAt);

  const onOpen = () => {
    void navigate(`/builder/${portfolio.data.data.resumeID}`);
  };

  const onUpdate = () => {
    open("update", { id: "portfolio", item: portfolio });
  };

  const onDuplicate = () => {
    open("duplicate", { id: "portfolio", item: portfolio });
  };

  const onLockChange = () => {
    lockOpen(portfolio.locked ? "update" : "create", { id: "lock", item: portfolio });
  };

  const onDelete = () => {
    open("delete", { id: "portfolio", item: portfolio });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-left">
        <BaseCard className="cursor-context-menu space-y-0">
          <AnimatePresence>
            {portfolio.locked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm"
              >
                <Lock size={42} />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
              "bg-gradient-to-t from-background/80 to-transparent",
            )}
          >
            <h4 className="line-clamp-2 font-medium">{portfolio.title}</h4>
            <p className="line-clamp-1 text-xs opacity-75">{t`Last updated ${lastUpdated}`}</p>
          </div>

          <img
            src={`/templates/jpg/${template}.jpg`}
            alt={template}
            className="rounded-sm opacity-80"
          />
        </BaseCard>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={onOpen}>
          <FolderOpen size={14} className="mr-2" />
          {t`Open`}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdate}>
          <PencilSimple size={14} className="mr-2" />
          {t`Rename`}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <CopySimple size={14} className="mr-2" />
          {t`Duplicate`}
        </DropdownMenuItem>
        {portfolio.locked ? (
          <DropdownMenuItem onClick={onLockChange}>
            <LockOpen size={14} className="mr-2" />
            {t`Unlock`}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onLockChange}>
            <Lock size={14} className="mr-2" />
            {t`Lock`}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-error" onClick={onDelete}>
          <TrashSimple size={14} className="mr-2" />
          {t`Delete`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
