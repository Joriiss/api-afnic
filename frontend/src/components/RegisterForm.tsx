import { useState } from 'react';
import type { ContactKind, MoralLegalStatus, RegisterRequest } from '../types';
import { Win98Window } from './Win98Window';

interface RegisterFormProps {
  onRegister: (payload: RegisterRequest) => Promise<void>;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string | null;
  mockMode?: boolean;
}

const EMPTY_FORM = {
  email: '',
  password: '',
  contactKind: 'physical' as ContactKind,
  contactName: '',
  firstName: '',
  organizationName: '',
  legalStatus: 'COMPANY' as MoralLegalStatus,
  sirenSiret: '',
  phone: '',
  firstStreet: '',
  secondStreet: '',
  complementaryStreet: '',
  cityName: '',
  postalCode: '',
  countryCode: 'FR',
};

export function RegisterForm({
  onRegister,
  onSwitchToLogin,
  loading,
  error,
  mockMode,
}: RegisterFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  function updateField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onRegister({
      email: form.email,
      password: form.password,
      contactKind: form.contactKind,
      contactName: form.contactName,
      firstName: form.contactKind === 'physical' ? form.firstName : undefined,
      organizationName: form.contactKind === 'moral' ? form.organizationName : undefined,
      legalStatus: form.contactKind === 'moral' ? form.legalStatus : undefined,
      sirenSiret: form.contactKind === 'moral' ? form.sirenSiret : undefined,
      phone: form.phone,
      address: {
        firstStreet: form.firstStreet,
        secondStreet: form.secondStreet || undefined,
        complementaryStreet: form.complementaryStreet || undefined,
        cityName: form.cityName,
        postalCode: form.postalCode,
        countryCode: form.countryCode,
      },
    });
  }

  return (
    <Win98Window title="Inscription client" icon="document" className="register-panel">
      <div className="panel-header">
        <h2>Créer un compte</h2>
        <fieldset className="win98-fieldset">
          <legend>Informations obligatoires</legend>
          <p>
            Vos informations seront enregistrées comme contact AFNIC pour pouvoir vérifier et enregistrer des
            domaines.
          </p>
          {mockMode && (
            <p className="login-hint">Mode simulation : aucun contact réel n&apos;est créé chez AFNIC.</p>
          )}
        </fieldset>
      </div>

      <form className="register-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="register-grid">
          <label className="field">
            <span>E-mail de connexion :</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Mot de passe :</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Type de contact :</span>
            <select
              value={form.contactKind}
              onChange={(event) => updateField('contactKind', event.target.value as ContactKind)}
              disabled={loading}
            >
              <option value="physical">Particulier</option>
              <option value="moral">Entreprise / association</option>
            </select>
          </label>

          <label className="field">
            <span>{form.contactKind === 'physical' ? 'Nom :' : 'Nom du contact :'}</span>
            <input
              type="text"
              value={form.contactName}
              onChange={(event) => updateField('contactName', event.target.value)}
              disabled={loading}
            />
          </label>

          {form.contactKind === 'physical' ? (
            <label className="field">
              <span>Prénom :</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                disabled={loading}
              />
            </label>
          ) : (
            <>
              <label className="field">
                <span>Organisation :</span>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(event) => updateField('organizationName', event.target.value)}
                  disabled={loading}
                />
              </label>

              <label className="field">
                <span>Statut juridique :</span>
                <select
                  value={form.legalStatus}
                  onChange={(event) => updateField('legalStatus', event.target.value as MoralLegalStatus)}
                  disabled={loading}
                >
                  <option value="COMPANY">Société</option>
                  <option value="ASSOCIATION">Association</option>
                  <option value="OTHER">Autre</option>
                </select>
              </label>

              <label className="field">
                <span>SIREN / SIRET :</span>
                <input
                  type="text"
                  value={form.sirenSiret}
                  onChange={(event) => updateField('sirenSiret', event.target.value)}
                  disabled={loading}
                />
              </label>
            </>
          )}

          <label className="field">
            <span>Téléphone :</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              disabled={loading}
              placeholder="06 12 34 56 78"
            />
          </label>

          <label className="field field-span-2">
            <span>Adresse :</span>
            <input
              type="text"
              value={form.firstStreet}
              onChange={(event) => updateField('firstStreet', event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Ville :</span>
            <input
              type="text"
              value={form.cityName}
              onChange={(event) => updateField('cityName', event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Code postal :</span>
            <input
              type="text"
              value={form.postalCode}
              onChange={(event) => updateField('postalCode', event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Pays :</span>
            <input
              type="text"
              value={form.countryCode}
              onChange={(event) => updateField('countryCode', event.target.value.toUpperCase())}
              disabled={loading}
              maxLength={2}
            />
          </label>
        </div>

        {error && (
          <div className="inline-error">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        <div className="win98-form-actions">
          <button className="win98-button win98-button-primary" type="submit" disabled={loading}>
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
          <button className="win98-button" type="button" disabled={loading} onClick={onSwitchToLogin}>
            J&apos;ai déjà un compte
          </button>
        </div>
      </form>
    </Win98Window>
  );
}
