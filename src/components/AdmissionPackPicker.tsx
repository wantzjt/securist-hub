import { ADMISSION_PACK_LIST, getAdmissionPack } from '#/lib/admission-packs'
import type { AdmissionPackIdV1, AdmissionPackV1 } from '#/lib/admission-packs'

export function AdmissionPackPicker({
  packId,
  onSelect,
}: {
  packId: AdmissionPackIdV1 | ''
  onSelect: (pack: AdmissionPackV1 | null) => void
}) {
  const selected = packId ? getAdmissionPack(packId) : undefined

  return (
    <div className="space-y-3">
      <div>
        <div className="ops-label" id="admission-pack-label">
          Admission pack (optional)
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--securist-muted)]">
          Scaffolds intended use and evidence gaps. Not a compliance
          certification. Team Graph is not live. No PQC claim.
        </p>
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="group"
          aria-labelledby="admission-pack-label"
        >
          <button
            type="button"
            className={`ops-btn${packId === '' ? ' ops-btn-solid' : ''}`}
            onClick={() => onSelect(null)}
          >
            Generic
          </button>
          {ADMISSION_PACK_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ops-btn${packId === p.id ? ' ops-btn-solid' : ''}`}
              onClick={() => onSelect(p)}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <div className="border border-[var(--securist-border)] bg-black/20 p-3 space-y-2">
          <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
            {selected.summary}
          </p>
          <p className="text-[11px] text-[var(--securist-muted)]">
            <span className="text-white">Admitted:</span> {selected.admitted}
          </p>
          <div className="ops-label">Evidence checklist (public sources)</div>
          <ul className="list-inside list-disc text-[11px] text-[var(--securist-muted)]">
            {selected.evidenceChecklist.map((item) => (
              <li key={item.id}>
                {item.required ? 'Required · ' : 'Optional · '}
                {item.label}
                <span className="block pl-4 text-[10px]">
                  {item.publicSourceHint} — unknown unless observed
                </span>
              </li>
            ))}
          </ul>
          <div className="ops-label">Out of scope</div>
          <ul className="list-inside list-disc text-[11px] text-[var(--securist-muted)]">
            {selected.outOfScope.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="text-[10px] text-[var(--securist-muted)]">
            {selected.dogfoodNotes}
          </p>
        </div>
      ) : null}
    </div>
  )
}
