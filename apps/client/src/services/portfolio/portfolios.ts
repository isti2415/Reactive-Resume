import type { PortfolioDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { RESUMES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchPortfolios = async () => {
  const response = await axios.get<PortfolioDto[], AxiosResponse<PortfolioDto[]>>("/portfolio");

  return response.data;
};

export const usePortfolios = () => {
  const {
    error,
    isPending: loading,
    data: portfolios,
  } = useQuery({
    queryKey: RESUMES_KEY,
    queryFn: fetchPortfolios,
  });

  return { portfolios, loading, error };
};
