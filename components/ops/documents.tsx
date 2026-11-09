import { copy } from "@/lib/copy";
import { formatLong } from "@/lib/format";

type OperatorDocument = {
  id: string;
  kind: "cv" | "certificate";
  file_name: string;
  uploaded_at: string;
  url: string;
};

function isImage(name: string) {
  return /\.(png|jpe?g)$/i.test(name);
}

export function OperatorDocuments({ documents }: { documents: OperatorDocument[] }) {
  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="text-gosi-blue">{copy.docsHeading}</h2>
      <p className="mt-1 text-sm text-gosi-midnight-80">{copy.docsHint}</p>
      {documents.length === 0 && <p className="mt-3 text-sm">{copy.docsEmpty}</p>}
      <ul className="mt-3 space-y-3">
        {documents.map((doc) => (
          <li key={doc.id} className="rounded-2xl bg-gosi-midnight-10 p-3 text-sm">
            <p className="font-medium">{doc.kind === "cv" ? copy.docsCv : copy.docsCertificate}</p>
            <p>{doc.file_name}</p>
            <p className="text-gosi-midnight-80">{formatLong(doc.uploaded_at)}</p>
            {doc.url && isImage(doc.file_name) && (
              <img src={doc.url} alt={doc.file_name} className="mt-2 max-h-64 rounded-xl" />
            )}
            {doc.url ? (
              <a className="mt-2 inline-block text-gosi-blue" href={doc.url} target="_blank" rel="noreferrer">
                {copy.docsOpen}
              </a>
            ) : (
              <p className="mt-2">{copy.docsUnavailable}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
