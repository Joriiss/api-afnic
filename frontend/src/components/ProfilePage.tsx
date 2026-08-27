import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../api/client';
import type { AuthStatusResponse, MoralLegalStatus, UpdateProfileRequest, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface ProfilePageProps {
  onProfileUpdated?: (status: AuthStatusResponse) => void;
}

interface ProfileFormState {
  contactName: string;
  firstName: string;
  organizationName: string;
  legalStatus: MoralLegalStatus;
  sirenSiret: string;
  phone: string;
  contactEmail: string;
  firstStreet: string;
  secondStreet: string;
  complementaryStreet: string;
  cityName: string;
  postalCode: string;
  countryCode: string;
}

function toFormState(user: UserProfile): ProfileFormState {
  return {
    contactName: user.contactName,
    firstName: user.firstName ?? '',
    organizationName: user.organizationName ?? '',
    legalStatus: user.legalStatus ?? 'COMPANY',
    sirenSiret: user.sirenSiret ?? '',
    phone: user.phone,
    contactEmail: user.contactEmail,
    firstStreet: user.address.firstStreet,
    secondStreet: user.address.secondStreet ?? '',
    complementaryStreet: user.address.complementaryStreet ?? '',
    cityName: user.address.cityName,
    postalCode: user.address.postalCode,
    countryCode: user.address.countryCode,
  };
}

export function ProfilePage({ onProfileUpdated }: ProfilePageProps) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const user = await fetchProfile();
        setProfile(user);
        setForm(toFormState(user));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function updateField<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!profile || !form) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: UpdateProfileRequest = {
      contactName: form.contactName,
      firstName: profile.contactKind === 'physical' ? form.firstName : undefined,
      organizationName: profile.contactKind === 'moral' ? form.organizationName : undefined,
      legalStatus: profile.contactKind === 'moral' ? form.legalStatus : undefined,
      sirenSiret: profile.contactKind === 'moral' ? form.sirenSiret || undefined : undefined,
      phone: form.phone,
      contactEmail: form.contactEmail,
      address: {
        firstStreet: form.firstStreet,
        secondStreet: form.secondStreet || undefined,
        complementaryStreet: form.complementaryStreet || undefined,
        cityName: form.cityName,
        postalCode: form.postalCode,
        countryCode: form.countryCode,
      },
    };

    try {
      const response = await updateProfile(payload);

      if (response.user) {
        setProfile(response.user);
        setForm(toFormState(response.user));
      }

      onProfileUpdated?.(response);
      setSuccess('Profil mis à jour.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form || !profile) {
    return (
      <Panel title="Mon profil" icon="document" accent className="profile-panel">
        <div className="loading-banner">
          {theme === 'win98' ? (
            <Win98Icon name="hourglass" size={24} className="win98-hourglass" />
          ) : (
            <span className="modern-spinner" aria-hidden="true" />
          )}
          Chargement du profil…
        </div>
        {error && (
          <section className="ui-alert ui-alert-error">
            <p>{error}</p>
          </section>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="Mon profil" icon="document" accent className="profile-panel">
      <div className="panel-header">
        <h2>Informations de contact</h2>
        <p>
          Mettez à jour vos coordonnées. Les changements d&apos;adresse, téléphone et e-mail de
          contact sont synchronisés avec AFNIC.
        </p>
      </div>

      <form className="register-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="register-grid">
          <label className="field">
            <span>E-mail de connexion</span>
            <input type="email" value={profile.email} disabled readOnly />
          </label>

          <label className="field">
            <span>Type de contact</span>
            <input
              type="text"
              value={profile.contactKind === 'moral' ? 'Organisation' : 'Particulier'}
              disabled
              readOnly
            />
          </label>

          <label className="field">
            <span>{profile.contactKind === 'physical' ? 'Nom' : 'Nom du contact'}</span>
            <input
              type="text"
              value={form.contactName}
              onChange={(event) => updateField('contactName', event.target.value)}
              disabled={saving}
            />
          </label>

          {profile.contactKind === 'physical' ? (
            <label className="field">
              <span>Prénom</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                disabled={saving}
              />
            </label>
          ) : (
            <>
              <label className="field">
                <span>Organisation</span>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(event) => updateField('organizationName', event.target.value)}
                  disabled={saving}
                />
              </label>

              <label className="field">
                <span>Statut juridique</span>
                <select
                  value={form.legalStatus}
                  onChange={(event) =>
                    updateField('legalStatus', event.target.value as MoralLegalStatus)
                  }
                  disabled={saving}
                >
                  <option value="COMPANY">Société</option>
                  <option value="ASSOCIATION">Association</option>
                  <option value="OTHER">Autre</option>
                </select>
              </label>

              <label className="field">
                <span>SIREN / SIRET</span>
                <input
                  type="text"
                  value={form.sirenSiret}
                  onChange={(event) => updateField('sirenSiret', event.target.value)}
                  disabled={saving}
                />
              </label>
            </>
          )}

          <label className="field">
            <span>E-mail de contact</span>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField('contactEmail', event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span>Téléphone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              disabled={saving}
              placeholder="06 12 34 56 78"
            />
          </label>

          <label className="field field-span-2">
            <span>Adresse</span>
            <input
              type="text"
              value={form.firstStreet}
              onChange={(event) => updateField('firstStreet', event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span>Ville</span>
            <input
              type="text"
              value={form.cityName}
              onChange={(event) => updateField('cityName', event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span>Code postal</span>
            <input
              type="text"
              value={form.postalCode}
              onChange={(event) => updateField('postalCode', event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span>Pays</span>
            <input
              type="text"
              value={form.countryCode}
              onChange={(event) => updateField('countryCode', event.target.value.toUpperCase())}
              disabled={saving}
              maxLength={2}
            />
          </label>
        </div>

        {error && (
          <div className="inline-error">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {success && (
          <section className="ui-alert ui-alert-success">
            <p>{success}</p>
          </section>
        )}

        <div className="win98-form-actions">
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
