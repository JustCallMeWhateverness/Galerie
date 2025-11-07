import type { ReactNode } from 'react';

type ProfileField = {
  label?: string;
  value: string | null | undefined;
};

type ProfileCardProps = {
  avatar?: string | null;
  title: string;
  fields?: ProfileField[];
  dateInfo?: {
    label: string;
    value: string | null | undefined;
    position?: 'avatar' | 'info';
  };
  actions?: ReactNode;
};

export default function ProfileCard({
  avatar,
  title,
  fields = [],
  dateInfo,
  actions,
}: ProfileCardProps) {
  return (
    <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="d-flex flex-column flex-sm-row align-items-start">
        <div className="me-sm-4 mb-3 mb-sm-0 text-center text-sm-start">
          <div
            className="rounded-3 bg-light d-flex align-items-center justify-content-center mx-auto mx-sm-0 overflow-hidden"
            style={{
              width: '180px',
              height: '280px',
              border: '1px solid #e9ecef'
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <i className="bi bi-person-fill text-muted" style={{ fontSize: '3rem' }}></i>
            )}
          </div>
          {dateInfo && dateInfo.position === 'avatar' && dateInfo.value && (
            <div className="text-dark small mt-2">
              {dateInfo.label}: {dateInfo.value}
            </div>
          )}
        </div>

        <div className="flex-grow-1" style={{ marginTop: '20px' }}>
          <div>
            <h4 className="fw-bold mb-1 text-dark">{title}</h4>
            {fields.map((field, index) => (
              field.value && (
                <div key={index} className="text-dark mb-1">
                  {field.value}
                </div>
              )
            ))}
            {dateInfo && dateInfo.position !== 'avatar' && dateInfo.value && (
              <div className="text-dark small">
                {dateInfo.label} {dateInfo.value}
              </div>
            )}
            {actions && (
              <div className="mt-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

