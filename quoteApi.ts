export type QuotePayload = {
  requestType: 'quote' | 'contact';
  customerType?: string;
  services?: string[];
  propertyDetails?: Record<string, string>;
  description?: string;
  contactName: string;
  email: string;
  phone?: string;
  preferredContact?: string;
  consent: boolean;
};

const getEndpoint = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('Die Anfrage konnte gerade nicht gesendet werden.');
  }

  return {
    url: `${baseUrl}/functions/v1/submit-quote`,
    anonKey,
  };
};

export async function submitQuoteRequest(payload: QuotePayload, photos: File[] = []) {
  const endpoint = getEndpoint();
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  photos.forEach((photo) => formData.append('photos', photo, photo.name));

  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${endpoint.anonKey}`,
      Apikey: endpoint.anonKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Die Anfrage konnte gerade nicht gesendet werden.');
  }

  return response.json() as Promise<{ success: boolean }>;
}
