import { ResumeDto } from "@Spark-It/dto";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { RESUMES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchResumes = async () => {
  const response = await axios.get<ResumeDto[], AxiosResponse<ResumeDto[]>>("/resume");

  return response.data;
};

export const useResumes = () => {
  const {
    error,
    isPending: loading,
    data: resumes,
  } = useQuery({
    queryKey: RESUMES_KEY,
    queryFn: fetchResumes,
  });

  return { resumes, loading, error };
};
