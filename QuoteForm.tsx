import { FormEvent, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileImage, X } from 'lucide-react';
import { submitQuoteRequest } from '@/lib/quoteApi';

const serviceOptions = [
  'Büroreinigung',
  'Glasreinigung',
  'Treppenhausreinigung',
  'Grundreinigung',
  'Baureinigung',
  'Schulreinigung',
  'Gebäudereinigung',
  'Privathaushalte',
];

type PhotoPreview = { id: string; file: File; url: string };

type FormState = {
  customerType: string;
  services: string[];
  address: string;
  postalCode: string;
  city: string;
  squareMeters: string;
  rooms: string;
  frequency: string;
  description: string;
  contactName: string;
  email: string;
  phone: string;
  preferredContact: string;
  consent: boolean;
};

const initialState: FormState = {
  customerType: '',
  services: [],
  address: '',
  postalCode: '',
  city: '',
  squareMeters: '',
  rooms: '',
  frequency: '',
  description: '',
  contactName: '',
  email: '',
  phone: '',
  preferredContact: 'E-Mail',
  consent: false,
};

const steps = ['Kundentyp', 'Leistung', 'Objekt', 'Fotos', 'Details', 'Kontakt', 'Übersicht'];

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const update = (key: keyof FormState, value: string | boolean | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage('');
  };

  const toggleService = (service: string) => {
    const next = form.services.includes(service)
      ? form.services.filter((item) => item !== service)
      : [...form.services, service];
    update('services', next);
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const accepted = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (accepted.length !== files.length) {
      setMessage('Bitte wählen Sie nur JPG-, JPEG-, PNG- oder WEBP-Dateien bis jeweils 5 MB aus.');
    }
    const available = Math.max(0, 6 - photos.length);
    setPhotos((current) => [...current, ...accepted.slice(0, available).map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, url: URL.createObjectURL(file) }))]);
    event.target.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const validateStep = () => {
    if (step === 1 && !form.customerType) return 'Bitte wählen Sie aus, ob Sie Privat- oder Gewerbekunde sind.';
    if (step === 2 && form.services.length === 0) return 'Bitte wählen Sie mindestens eine gewünschte Leistung aus.';
    if (step === 3 && (!form.address || !form.postalCode || !form.city || !form.squareMeters)) return 'Bitte ergänzen Sie Adresse, Ort und ungefähre Fläche.';
    if (step === 5 && !form.description.trim()) return 'Bitte beschreiben Sie kurz, was gereinigt werden soll.';
    if (step === 6 && (!form.contactName.trim() || !form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) return 'Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse ein.';
    if (step === 7 && !form.consent) return 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.';
    return '';
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('');
    setStep((current) => Math.min(7, current + 1));
  };

  const previous = () => {
    setMessage('');
    setStep((current) => Math.max(1, current - 1));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const error = validateStep();
    if (error) {
      setMessage(error);
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await submitQuoteRequest({
        requestType: 'quote',
        customerType: form.customerType,
        services: form.services,
        propertyDetails: {
          address: form.address,
          postalCode: form.postalCode,
          city: form.city,
          squareMeters: form.squareMeters,
          rooms: form.rooms,
          frequency: form.frequency,
        },
        description: form.description,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        preferredContact: form.preferredContact,
        consent: form.consent,
      }, photos.map((photo) => photo.file));
      setSubmitted(true);
    } catch {
      setMessage('Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per E-Mail.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="surface-card mx-auto max-w-3xl px-6 py-16 text-center sm:px-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={32} /></div>
        <p className="eyebrow justify-center">Anfrage erhalten</p>
        <h2 className="text-3xl font-extrabold text-[#082b4d] sm:text-4xl">Vielen Dank für Ihr Vertrauen.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[#60788c]">Wir prüfen Ihre Angaben persönlich und melden uns zeitnah über den von Ihnen gewünschten Kontaktweg. Das Angebot bleibt kostenlos und unverbindlich.</p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-[#e4edf3] bg-[#fbfdff] px-5 py-5 sm:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0c71ad]">Schritt {step} von 7</p><p className="mt-1 text-sm font-semibold text-[#60788c]">{steps[step - 1]}</p></div>
          <p className="hidden text-right text-xs text-[#8ca0b2] sm:block">Kostenlos & unverbindlich</p>
        </div>
        <div className="flex gap-1.5">
          {steps.map((label, index) => <div key={label} className={`h-1.5 flex-1 rounded-full transition-colors ${index < step ? 'bg-[#0c71ad]' : 'bg-[#dce8f0]'}`} aria-label={label} />)}
        </div>
      </div>

      <form onSubmit={submit} className="px-5 py-7 sm:px-8 sm:py-9">
        {step === 1 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Für wen dürfen wir reinigen?</p><div className="grid gap-4 sm:grid-cols-2">{['Privatkunde', 'Gewerbekunde'].map((type) => <button type="button" key={type} onClick={() => update('customerType', type)} className={`rounded-2xl border p-6 text-left transition ${form.customerType === type ? 'border-[#0c71ad] bg-blue-50 shadow-[0_0_0_3px_rgba(12,113,173,0.1)]' : 'border-[#d8e3ec] hover:border-[#89b9d6]'}`}><span className="mb-4 block text-2xl">{type === 'Privatkunde' ? '01' : '02'}</span><span className="font-bold text-[#17334c]">{type}</span><span className="mt-1 block text-sm text-[#71879a]">{type === 'Privatkunde' ? 'Für Ihr Zuhause' : 'Für Unternehmen und Immobilien'}</span></button>)}</div></div>}

        {step === 2 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Welche Leistungen interessieren Sie?</p><div className="grid gap-3 sm:grid-cols-2">{serviceOptions.map((service) => <label key={service} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${form.services.includes(service) ? 'border-[#0c71ad] bg-blue-50 text-[#0c71ad]' : 'border-[#d8e3ec] text-[#456176] hover:border-[#89b9d6]'}`}><input type="checkbox" checked={form.services.includes(service)} onChange={() => toggleService(service)} className="sr-only" /><span className={`flex h-5 w-5 items-center justify-center rounded-md border ${form.services.includes(service) ? 'border-[#0c71ad] bg-[#0c71ad] text-white' : 'border-[#b8cbd9]'}`}>{form.services.includes(service) && <Check size={14} />}</span>{service}</label>)}</div></div>}

        {step === 3 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Erzählen Sie uns von Ihrem Objekt.</p><div className="grid gap-5 sm:grid-cols-2"><label className="form-label sm:col-span-2">Adresse *<input className="form-input" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Straße und Hausnummer" /></label><label className="form-label">Postleitzahl *<input className="form-input" value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} placeholder="71634" /></label><label className="form-label">Ort *<input className="form-input" value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="Ludwigsburg" /></label><label className="form-label">Fläche in m² *<input type="number" min="1" className="form-input" value={form.squareMeters} onChange={(event) => update('squareMeters', event.target.value)} placeholder="z. B. 120" /></label><label className="form-label">Anzahl Räume<input type="number" min="1" className="form-input" value={form.rooms} onChange={(event) => update('rooms', event.target.value)} placeholder="z. B. 5" /></label><label className="form-label sm:col-span-2">Reinigungshäufigkeit<select className="form-input" value={form.frequency} onChange={(event) => update('frequency', event.target.value)}><option value="">Bitte auswählen</option><option>Einmalig</option><option>Wöchentlich</option><option>Mehrmals pro Woche</option><option>Alle zwei Wochen</option><option>Monatlich</option></select></label></div></div>}

        {step === 4 && <div className="fade-up"><p className="mb-2 text-lg font-bold text-[#17334c]">Möchten Sie uns Fotos senden?</p><p className="mb-6 text-sm text-[#71879a]">Fotos helfen uns, den Aufwand besser einzuschätzen. Dieser Schritt ist optional.</p><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="hidden" /><button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#9fb9cb] bg-[#fbfdff] px-5 py-10 text-center transition hover:border-[#0c71ad] hover:bg-blue-50"><FileImage className="mb-3 text-[#0c71ad]" size={28} /><span className="font-bold text-[#17334c]">Fotos auswählen</span><span className="mt-1 text-xs text-[#71879a]">JPG, JPEG, PNG oder WEBP · maximal 5 MB pro Datei</span></button>{photos.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo) => <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-[#e0eaf1]"><img src={photo.url} alt={photo.file.name} className="aspect-square w-full object-cover" /><button type="button" onClick={() => removePhoto(photo.id)} className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-[#17334c] shadow transition hover:text-red-600" aria-label={`${photo.file.name} entfernen`}><X size={15} /></button></div>)}</div>}</div>}

        {step === 5 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Was dürfen wir für Sie erledigen?</p><label className="form-label">Ihre Nachricht *<textarea className="form-input min-h-44 resize-y" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Beschreiben Sie kurz Ihre Wünsche, Besonderheiten oder den gewünschten Zeitraum." /></label></div>}

        {step === 6 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Wie dürfen wir Sie erreichen?</p><div className="grid gap-5 sm:grid-cols-2"><label className="form-label sm:col-span-2">Name / Ansprechpartner *<input className="form-input" value={form.contactName} onChange={(event) => update('contactName', event.target.value)} placeholder="Vor- und Nachname" /></label><label className="form-label">E-Mail-Adresse *<input type="email" className="form-input" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@beispiel.de" /></label><label className="form-label">Telefonnummer<input type="tel" className="form-input" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+49 ..." /></label><label className="form-label sm:col-span-2">Bevorzugter Kontaktweg<select className="form-input" value={form.preferredContact} onChange={(event) => update('preferredContact', event.target.value)}><option>E-Mail</option><option>Telefon</option><option>WhatsApp</option></select></label></div></div>}

        {step === 7 && <div className="fade-up"><p className="mb-6 text-lg font-bold text-[#17334c]">Prüfen und absenden</p><div className="space-y-3 rounded-2xl bg-[#f5f9fc] p-5 text-sm text-[#456176]"><div className="flex justify-between gap-4"><span>Kundentyp</span><strong className="text-right text-[#17334c]">{form.customerType}</strong></div><div className="flex justify-between gap-4"><span>Leistungen</span><strong className="text-right text-[#17334c]">{form.services.join(', ')}</strong></div><div className="flex justify-between gap-4"><span>Objekt</span><strong className="text-right text-[#17334c]">{form.postalCode} {form.city}, {form.squareMeters} m²</strong></div><div className="flex justify-between gap-4"><span>Kontakt</span><strong className="text-right text-[#17334c]">{form.contactName}, {form.email}</strong></div></div><label className="mt-6 flex cursor-pointer gap-3 text-sm leading-6 text-[#60788c]"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} className="mt-1 h-4 w-4 accent-[#0c71ad]" />Ich stimme zu, dass GLANVIA meine Angaben zur Bearbeitung dieser Anfrage gemäß der Datenschutzerklärung verarbeitet. *</label><p className="mt-5 text-xs text-[#8ca0b2]">Sie erhalten kein automatisches Preisangebot. Die Anfrage ist kostenlos und unverbindlich.</p></div>}

        {message && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#e8eff4] pt-6"><button type="button" onClick={previous} disabled={step === 1 || submitting} className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition ${step === 1 ? 'pointer-events-none text-[#c1ced8]' : 'text-[#456176] hover:bg-[#f1f6fa]'}`}><ArrowLeft size={17} /> Zurück</button>{step < 7 ? <button type="button" onClick={next} className="btn-primary">Weiter <ArrowRight size={17} /></button> : <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-wait disabled:opacity-60">{submitting ? 'Wird gesendet …' : 'Anfrage absenden'} <ArrowRight size={17} /></button>}</div>
      </form>
    </div>
  );
}
