import type { PortfolioDto } from "@reactive-resume/dto";
import _set from "lodash.set";
import type { TemporalState } from "zundo";
import { temporal } from "zundo";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { debouncedUpdateResume } from "../services/resume";

type PortfolioStore = {
  portfolio: PortfolioDto;

  // Actions
  setValue: (path: string, value: unknown) => void;
};

export const usePortfolioStore = create<PortfolioStore>()(
  temporal(
    immer((set) => ({
      portfolio: {} as PortfolioDto,
      setValue: (path, value) => {
        set((state) => {
          if (path === "visibility") {
            state.portfolio.visibility = value as "public" | "private";
          } else {
            state.portfolio.data = _set(state.portfolio.data, path, value);
          }

          void debouncedUpdateResume(JSON.parse(JSON.stringify(state.portfolio)));
        });
      },
    })),
    {
      limit: 100,
      wrapTemporal: (fn) => devtools(fn),
      partialize: ({ portfolio }) => ({ portfolio }),
    },
  ),
);

export const useTemporalPortfolioStore = <T>(
  selector: (state: TemporalState<Pick<PortfolioStore, "portfolio">>) => T,
  equality?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(usePortfolioStore.temporal, selector, equality);
