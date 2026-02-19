import { useContractContext } from "@/components/providers/ContractContext";
import { useEffect, useState } from "react";

export type SecretDetail = {
  id: bigint;
  owner: string;
  title: string;
  description: string;
  content: string;
  price: bigint;
};

const useSecretDetail = (secretId: number | bigint | null) => {
  const { contract } = useContractContext();
  const [summary, setSummary] = useState<SecretDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (contract == null || secretId == null) {
      setSummary(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    contract
      .getSecretSummary(secretId)
      .then((s: { id: bigint; owner: string; title: string; price: bigint }) => {
        if (cancelled) return;
        setSummary({
          id: s.id,
          owner: s.owner,
          title: s.title,
          description: "",
          content: "",
          price: s.price,
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contract, secretId]);

  return { summary, loading, error };
};

export default useSecretDetail;
