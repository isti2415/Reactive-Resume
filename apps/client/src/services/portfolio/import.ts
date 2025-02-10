import type { ImportPortfolioDto, PortfolioDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const importPortfolio = async (data: ImportPortfolioDto) => {
  const response = await axios.post<PortfolioDto, AxiosResponse<PortfolioDto>, ImportPortfolioDto>(
    "/portfolio/import",
    data,
  );

  return response.data;
};

export const useImportPortfolio = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: importPortfolioFn,
  } = useMutation({
    mutationFn: importPortfolio,
    onSuccess: (data) => {
      queryClient.setQueryData<PortfolioDto>(["portfolio", { id: data.id }], data);

      queryClient.setQueryData<PortfolioDto[]>(["portfolios"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { importPortfolio: importPortfolioFn, loading, error };
};
