import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../lib/axios";
import {
  createDemoRecord,
  deleteDemoRecord,
  readDemoRecords,
  updateDemoRecord,
} from "../../lib/demoRecords";

const fieldType = (field) => {
  if (field === "File") return "file";
  if (field.toLowerCase().includes("date")) return "date";
  if (field === "Decision" || field === "Status") return "select";
  if (field === "Description" || field === "Message") return "textarea";
  return "text";
};

const PlaceholderPage = ({ title, description, fields = [], resource }) => {
  const [records, setRecords] = useState([]);
  const [storageError, setStorageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRecords([]);
    setStorageError("");
    readDemoRecords(resource)
      .then((savedRecords) => {
        if (active) setRecords(savedRecords);
      })
      .catch((error) => {
        if (active) {
          setStorageError(getApiErrorMessage(error));
          toast.error("Online records could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resource]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const entries = await Promise.all(fields.map(async (field) => {
        const value = formData.get(field);
        if (value instanceof File) {
          if (!value.name) {
            const existing = records.find((record) => record.id === editingId);
            return [field, existing?.[field] || null];
          }
          if (value.size > 2 * 1024 * 1024) {
            throw new Error("Choose a file smaller than 2 MB.");
          }
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error || new Error("Could not read the selected file."));
            reader.readAsDataURL(value);
          });
          return [field, { name: value.name, size: value.size, type: value.type, dataUrl }];
        }
        return [field, String(value || "").trim()];
      }));
      const record = Object.fromEntries(entries);

      const savedRecord = editingId
        ? await updateDemoRecord(resource, editingId, record)
        : await createDemoRecord(resource, record);
      setRecords((currentRecords) => editingId
        ? currentRecords.map((item) => item.id === editingId ? savedRecord : item)
        : [savedRecord, ...currentRecords]);
      form.reset();
      setEditingId(null);
      toast.success(`${title} ${editingId ? "updated" : "saved"} online.`);
    } catch (error) {
      toast.error(`Could not save ${title.toLowerCase()}: ${getApiErrorMessage(error)}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDemoRecord(resource, id);
      setRecords((currentRecords) => currentRecords.filter((record) => record.id !== id));
      if (editingId === id) {
        setEditingId(null);
        formRef.current?.reset();
      }
      toast.success("Record deleted.");
    } catch (error) {
      toast.error(`Could not delete record: ${getApiErrorMessage(error)}`);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <p className="mt-2 text-xs text-emerald-700">Records are saved online for your account.</p>
      </header>

      <form ref={formRef} className="card max-w-3xl space-y-4" onSubmit={handleSubmit}>
        {fields.map((field) => {
          const type = fieldType(field);
          return (
            <label key={field} className="block">
              <span className="label">{field}</span>
              {type === "textarea" ? (
                <textarea className="input min-h-24" name={field} required />
              ) : type === "select" ? (
                <select className="input" name={field} defaultValue="" required>
                  <option value="" disabled>Select {field.toLowerCase()}</option>
                  {(field === "Decision"
                    ? ["Pending", "Approve", "Reject"]
                    : ["Active", "Pending", "Approved", "Rejected", "Completed"]).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    className="input"
                    name={field}
                    type={type}
                    required={type !== "file" || !editingId}
                    accept={type === "file" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" : undefined}
                  />
                  {type === "file" && (
                    <span className="mt-1 block text-xs text-slate-500">
                      Files up to 2 MB are stored online and can be downloaded later.
                    </span>
                  )}
                </>
              )}
            </label>
          );
        })}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">{editingId ? "Update" : "Save"}</button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={() => {
              setEditingId(null);
              formRef.current?.reset();
            }}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="space-y-3" aria-live="polite">
        <h2 className="text-lg font-semibold text-slate-800">Saved {title} ({records.length})</h2>
        {storageError && <p className="text-sm text-red-600">{storageError}</p>}
        {loading && <p className="card text-sm text-slate-500">Loading online records...</p>}
        {!loading && !storageError && records.length === 0 && (
          <p className="card text-sm text-slate-500">No records yet. Add one using the form above.</p>
        )}
        {!loading && !storageError && records.map((record) => (
          <article key={record.id} className="card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <dl className="grid flex-1 gap-3 sm:grid-cols-2">
              {fields.map((field) => {
                const value = record[field];
                const displayValue = value && typeof value === "object" ? value.name : value;
                if (!displayValue) return null;
                return (
                  <div key={field}>
                    <dt className="text-xs font-medium uppercase text-slate-500">{field}</dt>
                    <dd className="mt-1 break-words text-sm text-slate-800">
                      {value?.dataUrl ? (
                        <a className="text-blue-600 underline" href={value.dataUrl} download={value.name}>{displayValue}</a>
                      ) : displayValue}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="btn-outline btn-small"
                aria-label={`Edit ${title} record`}
                onClick={() => {
                  setEditingId(record.id);
                  fields.forEach((field) => {
                    if (field !== "File" && formRef.current?.elements.namedItem(field)) {
                      formRef.current.elements.namedItem(field).value = record[field] || "";
                    }
                  });
                  formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Edit
              </button>
              <button type="button" className="btn-danger btn-small" onClick={() => handleDelete(record.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
};

export default PlaceholderPage;
