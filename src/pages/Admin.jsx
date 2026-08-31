import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Edit3,
  MapPinned,
  Plus,
  Trash2,
  UsersRound,
  Map as MapIcon,
  CalendarDays,
  Home,
  Settings2,
  Image,
  Route,
  ShieldCheck,
} from 'lucide-react'
import { Modal } from '../components/Modal'
import { insertRow, updateRow, deleteRow } from '../services/data'
import {
  formatDate,
  formatTime,
  scheduleDate,
  scheduleTime,
  weekdayIndex,
  dayNames,
} from '../utils/constants'
import { generateSchedulePNG } from '../utils/png'

const tabs = [
  ['dashboard', 'Visão geral', Settings2],
  ['territories', 'Territórios', MapPinned],
  ['areas', 'Áreas no mapa', MapIcon],
  ['roads', 'Ruas', Route],
  ['groups', 'Grupos', UsersRound],
  ['members', 'Membros', UsersRound],
  ['locations', 'Locais', Home],
  ['schedules', 'Programação', CalendarDays],
  ['reports', 'Imagens / relatórios', Image],
]

export function Admin({ data, reload, setToast, onBack, onOpenMap }) {
  const [tab, setTab] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)

  const save = async (table, payload, id) => {
    try {
      if (id) await updateRow(table, id, payload)
      else await insertRow(table, payload)

      setModal(null)
      setEditing(null)
      setToast({ message: 'Alterações salvas com sucesso.' })
      await reload()
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', message: e?.message || 'Não foi possível salvar.' })
    }
  }

  const remove = async (table, id) => {
    if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return

    try {
      await deleteRow(table, id)
      setToast({ message: 'Item excluído.' })
      await reload()
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', message: e?.message || 'Não foi possível excluir.' })
    }
  }

  const open = (type, value = null) => {
    setEditing(value)
    setModal(type)
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <button className="icon-btn" onClick={onBack} type="button" aria-label="Voltar">
          <ArrowLeft />
        </button>
        <div>
          <span className="eyebrow">CONTROLE</span>
          <h1>Painel Administrativo</h1>
          <p className="admin-subtitle">Cadastre, organize e acompanhe todo o serviço de campo.</p>
        </div>
      </header>

      <div className="admin-tabs">
        {tabs.map(([key, label, Icon]) => (
          <button className={tab === key ? 'active' : ''} onClick={() => setTab(key)} key={key} type="button">
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <AdminDashboard data={data} onTab={setTab} />}

      {tab === 'territories' && (
        <Territories
          data={data}
          onNew={() => open('territory')}
          onEdit={(x) => open('territory', x)}
          onDelete={(x) => remove('territories', x)}
          onMap={(territory) => onOpenMap(territory.id)}
        />
      )}

      {tab === 'areas' && <Areas data={data} onMap={(territory) => onOpenMap(territory.id)} />}

      {tab === 'roads' && (
        <Roads
          data={data}
          onNew={() => open('road')}
          onEdit={(x) => open('road', x)}
          onDelete={(x) => remove('territory_roads', x)}
        />
      )}

      {tab === 'groups' && (
        <SimpleList
          title="Grupos"
          rows={data.groups}
          labelKey="name"
          onNew={() => open('group')}
          onEdit={(x) => open('group', x)}
          onDelete={(x) => remove('field_groups', x)}
        />
      )}

      {tab === 'members' && (
        <Members
          data={data}
          onNew={() => open('member')}
          onEdit={(x) => open('member', x)}
          onDelete={(x) => remove('members', x)}
        />
      )}

      {tab === 'locations' && (
        <SimpleList
          title="Locais de saída"
          rows={data.locations}
          labelKey="name"
          onNew={() => open('location')}
          onEdit={(x) => open('location', x)}
          onDelete={(x) => remove('field_locations', x)}
        />
      )}

      {tab === 'schedules' && (
        <Schedules
          data={data}
          onNew={() => open('schedule')}
          onEdit={(x) => open('schedule', x)}
          onDelete={(x) => remove('field_schedules', x)}
        />
      )}

      {tab === 'reports' && <Reports data={data} />}

      {modal === 'territory' && (
        <TerritoryForm
          value={editing}
          onClose={() => setModal(null)}
          onSave={(payload) => save('territories', payload, editing?.id)}
        />
      )}

      {modal === 'road' && (
        <RoadForm
          value={editing}
          data={data}
          onClose={() => setModal(null)}
          onSave={(payload) => save('territory_roads', payload, editing?.id)}
        />
      )}

      {modal === 'group' && (
        <GroupForm
          value={editing}
          onClose={() => setModal(null)}
          onSave={(payload) => save('field_groups', payload, editing?.id)}
        />
      )}

      {modal === 'member' && (
        <MemberForm
          value={editing}
          data={data}
          onClose={() => setModal(null)}
          onSave={(payload) => save('members', payload, editing?.id)}
        />
      )}

      {modal === 'location' && (
        <LocationForm
          value={editing}
          onClose={() => setModal(null)}
          onSave={(payload) => save('field_locations', payload, editing?.id)}
        />
      )}

      {modal === 'schedule' && (
        <ScheduleForm
          value={editing}
          data={data}
          onClose={() => setModal(null)}
          onSave={(payload) => save('field_schedules', payload, editing?.id)}
        />
      )}
    </div>
  )
}

function AdminDashboard({ data, onTab }) {
  const active = data.territories.filter((x) => x.active).length
  const latest = data.history.filter(Boolean).length
  const roads = data.roads?.length || 0

  return (
    <div className="admin-content">
      <div className="stats-grid">
        <div className="admin-stat"><b>{active}</b><span>Territórios ativos</span></div>
        <div className="admin-stat"><b>{data.members.filter((x) => x.active).length}</b><span>Membros ativos</span></div>
        <div className="admin-stat"><b>{data.schedules.length}</b><span>Programações</span></div>
        <div className="admin-stat"><b>{roads}</b><span>Ruas cadastradas</span></div>
      </div>

      <div className="admin-dashboard-grid">
        <button className="admin-feature" onClick={() => onTab('areas')} type="button">
          <MapPinned size={20} />
          <div><b>Delimitar territórios no mapa</b><span>Escolha um território e marque os pontos da área diretamente no mapa.</span></div>
        </button>

        <button className="admin-feature" onClick={() => onTab('roads')} type="button">
          <Route size={20} />
          <div><b>Cadastrar ruas por território</b><span>Cadastre as ruas e, quando desejar, uma faixa de números. Elas aparecem automaticamente na programação.</span></div>
        </button>

        <button className="admin-feature" onClick={() => onTab('reports')} type="button">
          <Image size={20} />
          <div><b>Gerar imagem da programação</b><span>Crie um PNG profissional com 6 a 10 saídas de campo.</span></div>
        </button>

        <button className="admin-feature" onClick={() => onTab('schedules')} type="button">
          <CalendarDays size={20} />
          <div><b>Controlar programação</b><span>Defina dia, horário, local, dirigente, território e rua.</span></div>
        </button>

        <button className="admin-feature" onClick={() => onTab('members')} type="button">
          <ShieldCheck size={20} />
          <div><b>Gerenciar equipe</b><span>Cadastre grupos, publicadores e dirigentes de campo.</span></div>
        </button>
      </div>

      <div className="admin-note">
        <CalendarDays size={20} />
        <div><b>Como funciona a rua automática</b><span>Na programação, primeiro escolha o território. O campo “Rua” passa a mostrar somente as ruas cadastradas naquele território.</span></div>
      </div>
    </div>
  )
}

function ActionHead({ title, onNew }) {
  return (
    <div className="section-head">
      <div><span className="eyebrow">ADMINISTRAÇÃO</span><h2>{title}</h2></div>
      <button className="primary-small" onClick={onNew} type="button"><Plus size={16} /> Novo</button>
    </div>
  )
}

function SimpleList({ title, rows, labelKey, onNew, onEdit, onDelete }) {
  return (
    <div className="admin-content">
      <ActionHead title={title} onNew={onNew} />
      <div className="admin-list">
        {rows.map((row) => (
          <div className="admin-row" key={row.id}>
            <div><b>{row[labelKey]}</b><span>{row.active ? 'Ativo' : 'Inativo'}</span></div>
            <div className="row-actions">
              <button aria-label="Editar" onClick={() => onEdit(row)} type="button"><Edit3 size={15} /></button>
              <button aria-label="Excluir" onClick={() => onDelete(row.id)} type="button"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {!rows.length && <div className="empty">Nenhum item cadastrado.</div>}
      </div>
    </div>
  )
}

function Territories({ data, onNew, onEdit, onDelete, onMap }) {
  return (
    <div className="admin-content">
      <ActionHead title="Territórios" onNew={onNew} />
      <div className="admin-list">
        {data.territories.map((territory) => (
          <div className="admin-row" key={territory.id}>
            <div className="territory-admin">
              <i style={{ background: territory.color || '#6D45A6' }} />
              <div>
                <b>{territory.name}</b>
                <span>{territory.nickname || 'Sem apelido'} · {territory.active ? 'Ativo' : 'Inativo'} · {Array.isArray(territory.polygon) ? 'Área definida' : 'Área não definida'}</span>
              </div>
            </div>
            <div className="row-actions">
              <button title="Definir área no mapa" onClick={() => onMap(territory)} type="button"><MapIcon size={15} /></button>
              <button title="Editar" onClick={() => onEdit(territory)} type="button"><Edit3 size={15} /></button>
              <button title="Excluir" onClick={() => onDelete(territory.id)} type="button"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {!data.territories.length && <div className="empty">Nenhum território cadastrado.</div>}
      </div>
    </div>
  )
}

function Areas({ data, onMap }) {
  const activeTerritories = data.territories.filter((x) => x.active)

  return (
    <div className="admin-content">
      <div className="section-head">
        <div><span className="eyebrow">MAPA</span><h2>Áreas no mapa</h2><p>Defina visualmente os limites de cada território.</p></div>
      </div>
      <div className="admin-note"><MapPinned size={20} /><div><b>Como delimitar</b><span>Selecione um território. O mapa abrirá com ele selecionado; use “Desenhar território”, marque os pontos e salve.</span></div></div>
      <div className="admin-list area-list">
        {activeTerritories.map((territory) => (
          <button className="area-row" key={territory.id} onClick={() => onMap(territory)} type="button">
            <span className="area-color" style={{ background: territory.color || '#6D45A6' }} />
            <div><b>{territory.name}</b><small>{Array.isArray(territory.polygon) ? 'Área já definida' : 'Ainda sem área no mapa'}</small></div>
            <MapPinned size={17} />
          </button>
        ))}
        {!activeTerritories.length && <div className="empty">Cadastre um território primeiro.</div>}
      </div>
    </div>
  )
}

function Roads({ data, onNew, onEdit, onDelete }) {
  const territories = useMemo(() => new globalThis.Map(data.territories.map((x) => [x.id, x.name])), [data.territories])

  return (
    <div className="admin-content">
      <ActionHead title="Ruas por território" onNew={onNew} />
      <div className="admin-note"><Route size={20} /><div><b>Essas ruas alimentam a programação</b><span>Depois de escolher um território em “Programação”, somente as ruas ligadas a ele aparecem no campo Rua.</span></div></div>
      <div className="admin-list">
        {(data.roads || []).map((road) => (
          <div className="admin-row" key={road.id}>
            <div>
              <b>{road.road_name}</b>
              <span>
                {territories.get(road.territory_id) || 'Território não definido'}
                {road.number_start != null || road.number_end != null ? ` · ${road.number_start ?? '—'}–${road.number_end ?? '—'}` : ''}
                {road.reference ? ` · ${road.reference}` : ''}
              </span>
            </div>
            <div className="row-actions">
              <button title="Editar" onClick={() => onEdit(road)} type="button"><Edit3 size={15} /></button>
              <button title="Excluir" onClick={() => onDelete(road.id)} type="button"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {!(data.roads || []).length && <div className="empty">Nenhuma rua cadastrada. Clique em <b>Novo</b> para cadastrar.</div>}
      </div>
    </div>
  )
}

function Members({ data, onNew, onEdit, onDelete }) {
  return (
    <div className="admin-content">
      <ActionHead title="Membros" onNew={onNew} />
      <div className="admin-list">
        {data.members.map((member) => {
          const name = member.name || member.full_name || 'Sem nome'
          return (
            <div className="admin-row" key={member.id}>
              <div><b>{name}</b><span>{data.groups.find((g) => g.id === member.group_id)?.name || 'Sem grupo'} · {member.member_type === 'field_leader' ? 'Dirigente de campo' : 'Publicador'} · {member.active ? 'Ativo' : 'Inativo'}</span></div>
              <div className="row-actions">
                <button onClick={() => onEdit(member)} type="button"><Edit3 size={15} /></button>
                <button onClick={() => onDelete(member.id)} type="button"><Trash2 size={15} /></button>
              </div>
            </div>
          )
        })}
        {!data.members.length && <div className="empty">Nenhum membro cadastrado.</div>}
      </div>
    </div>
  )
}

function Schedules({ data, onNew, onEdit, onDelete }) {
  const locs = new globalThis.Map(data.locations.map((x) => [x.id, x.name]))
  const terrs = new globalThis.Map(data.territories.map((x) => [x.id, x.name]))
  const leaders = new globalThis.Map(data.members.map((x) => [x.id, x.name || x.full_name || 'Sem nome']))
  const rows = [...data.schedules].sort((a, b) => `${scheduleDate(a) || '9999-99-99'} ${scheduleTime(a) || ''}`.localeCompare(`${scheduleDate(b) || '9999-99-99'} ${scheduleTime(b) || ''}`))

  return (
    <div className="admin-content">
      <ActionHead title="Programação" onNew={onNew} />
      <div className="admin-note"><CalendarDays size={20} /><div><b>Território → Rua</b><span>Escolha o território primeiro. A rua será carregada automaticamente a partir do cadastro de ruas daquele território.</span></div></div>
      <div className="admin-list">
        {rows.slice(0, 100).map((schedule) => {
          const date = scheduleDate(schedule)
          const weekday = weekdayIndex(schedule)
          return (
            <div className="admin-row" key={schedule.id}>
              <div>
                <b>{date ? formatDate(date) : weekday !== null ? dayNames[weekday] : 'Dia não definido'} · {formatTime(scheduleTime(schedule))}</b>
                <span>{locs.get(schedule.location_id) || 'Sem local'} · {leaders.get(schedule.leader_id) || 'Sem dirigente'} · {terrs.get(schedule.territory_id) || 'Sem território'}{schedule.road_name ? ` · ${schedule.road_name}` : ''}</span>
                <span>{schedule.status === 'completed' ? 'Concluído' : schedule.status === 'cancelled' ? 'Cancelado' : 'Programado'}</span>
              </div>
              <div className="row-actions">
                <button title="Editar programação" onClick={() => onEdit(schedule)} type="button"><Edit3 size={15} /></button>
                <button title="Excluir programação" onClick={() => onDelete(schedule.id)} type="button"><Trash2 size={15} /></button>
              </div>
            </div>
          )
        })}
        {!rows.length && <div className="empty">Nenhuma programação cadastrada. Clique em <b>Novo</b> para criar a primeira.</div>}
      </div>
    </div>
  )
}

function Reports({ data }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [limit, setLimit] = useState(6)

  const locs = new globalThis.Map(data.locations.map((x) => [x.id, x.name]))
  const leaders = new globalThis.Map(data.members.map((x) => [x.id, x.name || x.full_name || 'Sem nome']))
  const terrs = new globalThis.Map(data.territories.map((x) => [x.id, x.name]))

  const rows = [...data.schedules]
    .filter((x) => x.status !== 'cancelled')
    .sort((a, b) => `${scheduleDate(a) || '9999-99-99'} ${scheduleTime(a) || ''}`.localeCompare(`${scheduleDate(b) || '9999-99-99'} ${scheduleTime(b) || ''}`))

  const availableOptions = Array.from({ length: Math.max(0, Math.min(10, rows.length) - 5) }, (_, i) => i + 6)
  const canGenerate = rows.length >= 6 && limit >= 6 && limit <= Math.min(10, rows.length)

  const generate = async () => {
    if (!canGenerate) {
      setMessage('É necessário ter pelo menos 6 saídas de campo. A imagem aceita de 6 a 10 saídas.')
      return
    }

    setBusy(true)
    setMessage('')

    try {
      await generateSchedulePNG(rows.slice(0, limit), locs, leaders, terrs)
      setMessage(`PNG gerado com ${limit} saídas de campo.`)
    } catch (e) {
      console.error(e)
      setMessage(`Não foi possível gerar a imagem: ${e?.message || 'erro desconhecido'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-content">
      <div className="section-head">
        <div><span className="eyebrow">COMPARTILHAMENTO</span><h2>Imagens / relatórios</h2><p>Gere um PNG profissional da programação para compartilhar.</p></div>
      </div>

      <div className="report-card report-card-strong">
        <div className="report-icon"><Image size={22} /></div>
        <div>
          <b>Imagem da programação</b>
          <span>O relatório é gerado obrigatoriamente com <strong>6 a 10 saídas de campo</strong>. Escolha a quantidade abaixo.</span>
        </div>
        <label className="report-limit">Quantidade
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} disabled={!availableOptions.length}>
            {availableOptions.length ? availableOptions.map((n) => <option key={n} value={n}>{n} saídas de campo</option>) : <option value={6}>6 saídas de campo</option>}
          </select>
        </label>
        <button className="primary-small" disabled={busy || !canGenerate} onClick={generate} type="button">
          <Image size={16} />
          {busy ? 'Gerando…' : 'Gerar imagem (PNG)'}
        </button>
      </div>

      {rows.length < 6 && (
        <div className="admin-note report-warning">
          <CalendarDays size={19} />
          <div><b>Faltam saídas para gerar o PNG</b><span>Há {rows.length} saída(s) disponível(is). Cadastre pelo menos 6 programações para liberar a geração.</span></div>
        </div>
      )}

      {rows.length >= 6 && (
        <div className="admin-note report-ready">
          <Image size={19} />
          <div><b>Pronto para gerar</b><span>Há {rows.length} saídas disponíveis. Você pode gerar uma imagem com 6 a {Math.min(10, rows.length)} delas.</span></div>
        </div>
      )}

      {message && <div className="admin-note report-message"><Image size={18} /><div><b>{message.startsWith('PNG') ? 'Pronto' : 'Atenção'}</b><span>{message}</span></div></div>}
    </div>
  )
}

function FormShell({ title, onClose, onSubmit, children }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form className="form-grid" onSubmit={onSubmit}>
        {children}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-btn">Salvar</button>
        </div>
      </form>
    </Modal>
  )
}

function TerritoryForm({ value, onClose, onSave }) {
  return (
    <FormShell title={value ? 'Editar território' : 'Novo território'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      onSave({
        name: String(form.get('name') || '').trim(),
        nickname: form.get('nickname') || null,
        description: form.get('description') || null,
        color: form.get('color'),
        active: form.get('active') === 'on',
      })
    }}>
      <label>Nome oficial<input name="name" defaultValue={value?.name || ''} required /></label>
      <label>Apelido<input name="nickname" defaultValue={value?.nickname || ''} /></label>
      <label className="full">Descrição<textarea name="description" defaultValue={value?.description || ''} /></label>
      <label>Cor<input name="color" type="color" defaultValue={value?.color || '#6D45A6'} /></label>
      <label className="check-label"><input name="active" type="checkbox" defaultChecked={value?.active ?? true} /> Ativo</label>
    </FormShell>
  )
}

function RoadForm({ value, data, onClose, onSave }) {
  return (
    <FormShell title={value ? 'Editar rua' : 'Nova rua'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const roadName = String(form.get('road_name') || '').trim()
      if (!roadName) return

      onSave({
        territory_id: form.get('territory_id') || null,
        road_name: roadName,
        number_start: form.get('number_start') ? Number(form.get('number_start')) : null,
        number_end: form.get('number_end') ? Number(form.get('number_end')) : null,
        reference: form.get('reference') || null,
      })
    }}>
      <label className="full">Território<select name="territory_id" defaultValue={value?.territory_id || ''} required><option value="">Selecione um território</option>{data.territories.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="full">Nome da rua<input name="road_name" defaultValue={value?.road_name || ''} placeholder="Ex.: Rua São Paulo" required /></label>
      <label>Nº inicial<input name="number_start" type="number" min="0" defaultValue={value?.number_start ?? ''} /></label>
      <label>Nº final<input name="number_end" type="number" min="0" defaultValue={value?.number_end ?? ''} /></label>
      <label className="full">Referência / observação<input name="reference" defaultValue={value?.reference || ''} placeholder="Ex.: lado direito, até a praça" /></label>
    </FormShell>
  )
}

function GroupForm({ value, onClose, onSave }) {
  return (
    <FormShell title={value ? 'Editar grupo' : 'Novo grupo'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      onSave({ name: form.get('name'), description: form.get('description') || null, active: form.get('active') === 'on' })
    }}>
      <label>Nome<input name="name" defaultValue={value?.name || ''} required /></label>
      <label>Descrição<input name="description" defaultValue={value?.description || ''} /></label>
      <label className="check-label"><input name="active" type="checkbox" defaultChecked={value?.active ?? true} /> Ativo</label>
    </FormShell>
  )
}

function MemberForm({ value, data, onClose, onSave }) {
  const existingName = value?.name || value?.full_name || ''

  return (
    <FormShell title={value ? 'Editar membro' : 'Novo membro'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const name = String(form.get('name') || '').trim()
      if (!name) return
      onSave({ name, group_id: form.get('group_id') || null, member_type: form.get('member_type') || 'publisher', active: form.get('active') === 'on' })
    }}>
      <label className="full">Nome completo<input name="name" defaultValue={existingName} placeholder="Ex.: João da Silva" required autoComplete="off" /></label>
      <label>Grupo<select name="group_id" defaultValue={value?.group_id || ''}><option value="">Sem grupo</option>{data.groups.filter((x) => x.active || x.id === value?.group_id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Função<select name="member_type" defaultValue={value?.member_type || 'publisher'}><option value="publisher">Publicador</option><option value="field_leader">Dirigente de campo</option></select></label>
      <label className="check-label"><input name="active" type="checkbox" defaultChecked={value?.active ?? true} /> Ativo</label>
    </FormShell>
  )
}

function LocationForm({ value, onClose, onSave }) {
  return (
    <FormShell title={value ? 'Editar local' : 'Novo local'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      onSave({ name: form.get('name'), address: form.get('address') || null, active: form.get('active') === 'on' })
    }}>
      <label>Nome<input name="name" defaultValue={value?.name || ''} required /></label>
      <label>Endereço<input name="address" defaultValue={value?.address || ''} /></label>
      <label className="check-label"><input name="active" type="checkbox" defaultChecked={value?.active ?? true} /> Ativo</label>
    </FormShell>
  )
}

function ScheduleForm({ value, data, onClose, onSave }) {
  const [territoryId, setTerritoryId] = useState(value?.territory_id || '')
  const wi = weekdayIndex(value)
  const initialTime = formatTime(scheduleTime(value))

  const roads = useMemo(() => {
    if (!territoryId) return []
    return (data.roads || []).filter((road) => road.territory_id === territoryId).sort((a, b) => a.road_name.localeCompare(b.road_name, 'pt-BR'))
  }, [data.roads, territoryId])

  const selectedRoad = roads.find((road) => road.road_name === value?.road_name)

  return (
    <FormShell title={value ? 'Editar programação' : 'Nova programação'} onClose={onClose} onSubmit={(e) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const weekday = Number(form.get('weekday'))
      const time = String(form.get('time') || '').slice(0, 5)
      const territory = String(form.get('territory_id') || '')
      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || !/^\d{2}:\d{2}$/.test(time)) return

      const roadId = String(form.get('road_id') || '')
      const road = roads.find((x) => x.id === roadId)

      onSave({
        weekday,
        weekday_name: dayNames[weekday],
        time,
        start_time: time,
        service_date: form.get('service_date') || null,
        location_id: form.get('location_id') || null,
        leader_id: form.get('leader_id') || null,
        territory_id: territory || null,
        road_name: road?.road_name || form.get('road_manual') || null,
        number_start: form.get('number_start') ? Number(form.get('number_start')) : road?.number_start ?? null,
        number_end: form.get('number_end') ? Number(form.get('number_end')) : road?.number_end ?? null,
        note: form.get('note') || null,
        status: form.get('status') || 'scheduled',
      })
    }}>
      <label>Dia da semana<select name="weekday" defaultValue={wi ?? 1} required>{dayNames.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
      <label>Horário<input type="time" name="time" defaultValue={initialTime === '—' ? '18:30' : initialTime} required /></label>
      <label>Data específica (opcional)<input type="date" name="service_date" defaultValue={value?.service_date || ''} /></label>
      <label>Local<select name="location_id" defaultValue={value?.location_id || ''}><option value="">Sem local</option>{data.locations.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Dirigente<select name="leader_id" defaultValue={value?.leader_id || ''}><option value="">Sem dirigente</option>{data.members.filter((x) => x.active && x.member_type === 'field_leader').map((x) => <option key={x.id} value={x.id}>{x.name || x.full_name || 'Sem nome'}</option>)}</select></label>

      <label>Território<select name="territory_id" value={territoryId} onChange={(e) => setTerritoryId(e.target.value)}><option value="">Sem território</option>{data.territories.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>

      <label className="full schedule-road-field">
        Rua <span className="field-help">{territoryId ? `${roads.length} rua(s) cadastrada(s) neste território` : 'selecione um território primeiro'}</span>
        <select key={`road-${territoryId}`} name="road_id" defaultValue={selectedRoad?.id || ''} disabled={!territoryId || !roads.length}>
          <option value="">{!territoryId ? 'Selecione o território primeiro' : !roads.length ? 'Nenhuma rua cadastrada neste território' : 'Selecione uma rua'}</option>
          {roads.map((road) => <option key={road.id} value={road.id}>{road.road_name}{road.number_start != null || road.number_end != null ? ` · ${road.number_start ?? '—'}–${road.number_end ?? '—'}` : ''}</option>)}
        </select>
        {!roads.length && territoryId && <input key={`manual-road-${territoryId}`} name="road_manual" placeholder="Digite a rua manualmente, se necessário" defaultValue={value?.road_name || ''} />}
      </label>

      <label>Nº inicial<input name="number_start" type="number" min="0" defaultValue={value?.number_start ?? selectedRoad?.number_start ?? ''} /></label>
      <label>Nº final<input name="number_end" type="number" min="0" defaultValue={value?.number_end ?? selectedRoad?.number_end ?? ''} /></label>
      <label>Status<select name="status" defaultValue={value?.status || 'scheduled'}><option value="scheduled">Programado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label>
      <label className="full">Observação<textarea name="note" defaultValue={value?.note || ''} placeholder="Observações sobre este serviço" /></label>
    </FormShell>
  )
}
