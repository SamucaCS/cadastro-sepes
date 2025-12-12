/* SEAPE – Supabase (CRUD) + Editar + cores status */

const SUPABASE_URL = "https://ffprsdeicjjttfedzbif.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcHJzZGVpY2pqdHRmZWR6YmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTg4NTksImV4cCI6MjA4MTEzNDg1OX0.U5J1L6vv7RZztxUjJ4UKcNhtHzwOlaU0NTeXoyAa0GU";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEMAS = {
    EVOLUCAO_FUNCIONAL: "Evolução funcional",
    APOSENTADORIA: "Aposentadoria",
    FAI_PUCT: "FAI & PUCT",
};

const ESCOLAS_SEOM = [
    "Unidade Regional De Ensino - Suzano",
    "ALFREDO ROBERTO",
    "ALICE ROMANOS PROFª",
    "ANDERSON DA SILVA SOARES",
    "ANGELA SUELI P DIAS",
    "ANIS FADUL DOUTOR",
    "ANTONIO BRASILIO MENEZES DA FONSECA PROF",
    "ANTONIO GARCIA VEREADOR",
    "ANTONIO JOSE CAMPOS DE MENEZES PROF",
    "ANTONIO RODRIGUES DE ALMEIDA",
    "ANTONIO VALDEMAR GALO VEREADOR",
    "BATISTA RENZI",
    "BENEDITA DE CAMPOS MARCOLONGO PROFª",
    "BRASILIO MACHADO NETO COMENDADOR",
    "CARLINDO REIS",
    "CARLOS MOLTENI PROF",
    "CHOJIRO SEGAWA",
    "DAVID JORGE CURI PROF",
    "EDIR DO COUTO ROSA",
    "ELIANE APARECIDA D DA SILVA",
    "EUCLIDES IGESCA",
    "GERALDO JUSTINIANO DE REZENDE SILVA PROF",
    "GILBERTO DE CARVALHO PROF",
    "GIOVANNI BATTISTA RAFFO PROF DOUTOR",
    "HELENA ZERRENNER",
    "IIJIMA",
    "IGNES CORREA ALLEN",
    "JACQUES YVES COUSTEAU COMANDANTE",
    "JANDYRA COUTINHO PROFª",
    "JARDIM SAO PAULO II",
    "Jose Eduardo Viera Raduan",
    "JOSE BENEDITO LEITE BARTHOLOMEI PROF",
    "JOSE CAMILO DE ANDRADE",
    "JOSE PAPAIZ PROF",
    "JOVIANO SATLER DE LIMA PROF",
    "JUSSARA FEITOSA DOMSCHKE PROFª",
    "Justino Marcondes Rangel",
    "Landia dos Santos Batista",
    "LEDA FERNANDES LOPES PROFª",
    "LUCY FRANCO KOWALSKI PROFª",
    "LUIZ BIANCONI",
    "LUIZA HIDAKA PROFª",
    "MANUEL DOS SANTOS PAIVA",
    "MARIA ELISA DE AZEVEDO CINTRA PROFª",
    "Mario Manoel Dantas de Aquino",
    "MARTHA CALIXTO CAZAGRANDE",
    "MASAITI SEKINE PROF",
    "MORATO DE OLIVEIRA DOUTOR",
    "OLAVO LEONEL FERREIRA PROF",
    "OLZANETTI GOMES PROFESSOR",
    "OSWALDO DE OLIVEIRA LIMA",
    "PARQUE DOURADO II",
    "PAULO AMERICO PAGANUCCI",
    "PAULO KOBAYASHI PROF",
    "RAUL BRASIL PROF EE",
    "RAUL BRASIL PROF",
    "ROBERTO BIANCHI",
    "SEBASTIAO PEREIRA VIDAL",
    "Tacito Zancheta",
    "TOCHICHICO YOCHICAVA PROF",
    "TOKUZO TERAZAKI",
    "YOLANDA BASSI PROFª",
    "ZELIA GATTAI AMADO",
    "ZEIKICHI FUKUOKA",
];

const $ = (sel) => document.querySelector(sel);

let temaAtual = null;
let editingId = null;
let registros = [];

document.addEventListener("DOMContentLoaded", () => {
    const btnIrIndex = document.getElementById("btnIrIndex");
    const btnIrSefrep = document.getElementById("btnIrSefrep");
    if (btnIrIndex) btnIrIndex.addEventListener("click", () => (window.location.href = "index.html"));
    if (btnIrSefrep) btnIrSefrep.addEventListener("click", () => (window.location.href = "sefrep.html"));

    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            temaAtual = btn.dataset.tema;

            cancelEdit(true);
            renderForm();
        });
    });

    $("#formSeape")?.addEventListener("submit", onSubmit);
    $("#btnCancelar")?.addEventListener("click", () => cancelEdit());
    $("#btnLimpar")?.addEventListener("click", () => {
        $("#formSeape").reset();
        showMsg("Campos limpos.", "ok");
    });

    $("#btnApagarTudo")?.addEventListener("click", apagarTudoSupabase);
    $("#btnExportar")?.addEventListener("click", exportarJSON);

    initTemaAtivo();
    loadAndRender();
});

function initTemaAtivo() {
    const active =
        document.querySelector(".nav-item.active") ||
        document.querySelector(".nav-item");

    temaAtual = active?.dataset?.tema || "EVOLUCAO_FUNCIONAL";

    document.querySelectorAll(".nav-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.tema === temaAtual);
    });

    renderForm();
}

async function loadAndRender() {
    const ok = await loadRecords();
    if (ok) renderTable();
}

async function loadRecords() {
    try {
        const { data, error } = await supabaseClient
            .from("seape_registros")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1000);

        if (error) throw error;
        registros = data || [];
        return true;
    } catch (err) {
        showMsg(`Erro ao carregar registros: ${err.message || err}`, "err");
        return false;
    }
}

function renderForm() {
    const titulo = TEMAS[temaAtual] || temaAtual;
    $("#tituloForm").textContent = titulo;
    $("#pillTema").innerHTML = `Tema: <strong>${escapeHtml(titulo)}</strong>`;
    showMsg("");

    const area = $("#formArea");
    if (!area) return;
    area.innerHTML = "";

    const campos = [];

    if (temaAtual === "EVOLUCAO_FUNCIONAL") {
        campos.push(
            fieldText("nome", "Nome *", true),
            fieldText("protocolo", "Número de protocolo *", true),
            fieldSelect("status", "Status *", ["em andamento", "não concluido", "concluido"], true),
            fieldTextarea("observacoes", "Observação", false),
            fieldDate("data_entrada", "Data de entrada *", true),
            fieldDate("data_saida", "Data de saída", false)
        );
    }

    if (temaAtual === "APOSENTADORIA") {
        campos.push(
            fieldText("nome", "Nome *", true),
            fieldText("protocolo", "Número de protocolo *", true),
            fieldSelect("status", "Status *", ["em andamento", "atendendo exigencias", "concluido", "não concluido"], true),
            fieldTextarea("observacoes", "Observações", false)
        );
    }

    if (temaAtual === "FAI_PUCT") {
        campos.push(
            fieldText("nome", "Nome *", true),
            fieldText("processo", "Número do processo *", true),
            fieldSelect("escola", "Escola *", ESCOLAS_SEOM, true),
            fieldSelect("status", "Status *", ["em andamento", "concluido", "não concluido"], true)
        );
    }

    const grid = document.createElement("div");
    grid.className = "grid";
    grid.innerHTML = campos.join("");
    area.appendChild(grid);

    area.querySelectorAll("textarea").forEach((t) => {
        const wrap = t.closest(".field");
        if (wrap) wrap.style.gridColumn = "1 / -1";
    });

    updateSubmitText();
}

async function onSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;

    const data = formToObj(form);
    data.tema_key = temaAtual;
    data.tema = TEMAS[temaAtual] || temaAtual;

    const valid = validate(data);
    if (!valid.ok) {
        showMsg(valid.msg, "err");
        return;
    }

    const payload = {
        tema_key: data.tema_key,
        tema: data.tema,
        nome: data.nome || null,
        escola: data.escola || null,
        protocolo: data.protocolo || null,
        processo: data.processo || null,
        status: data.status || null,
        observacoes: data.observacoes || null,
        data_entrada: data.data_entrada || null,
        data_saida: data.data_saida || null,
    };

    // aposentadoria não tem datas
    if (temaAtual === "APOSENTADORIA") {
        payload.data_entrada = null;
        payload.data_saida = null;
    }

    try {
        if (editingId) {
            const { error } = await supabaseClient
                .from("seape_registros")
                .update(payload)
                .eq("id", editingId);

            if (error) throw error;
            showMsg("Registro atualizado.", "ok");
        } else {
            const { error } = await supabaseClient
                .from("seape_registros")
                .insert([payload]);

            if (error) throw error;
            showMsg("Registro salvo.", "ok");
        }

        cancelEdit(true);
        await loadAndRender();
    } catch (err) {
        showMsg(`Erro ao salvar: ${err.message || err}`, "err");
    }
}

function startEditById(id) {
    const r = registros.find((x) => x.id === id);
    if (!r) return;

    temaAtual = r.tema_key || "EVOLUCAO_FUNCIONAL";
    document.querySelectorAll(".nav-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.tema === temaAtual);
    });

    renderForm();

    setVal("nome", r.nome);
    setVal("protocolo", r.protocolo);
    setVal("processo", r.processo);
    setVal("status", r.status);
    setVal("escola", r.escola);
    setVal("observacoes", r.observacoes);
    setVal("data_entrada", r.data_entrada);
    setVal("data_saida", r.data_saida);

    editingId = r.id;
    updateSubmitText();
    showMsg("Editando registro… (faça as alterações e clique em Atualizar)", "ok");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit(keepMessage = false) {
    editingId = null;
    $("#formSeape")?.reset();
    updateSubmitText();
    if (!keepMessage) showMsg("");
}

function updateSubmitText() {
    const btn = document.querySelector('#formSeape button[type="submit"]');
    if (!btn) return;
    btn.textContent = editingId ? "Atualizar registro" : "Salvar registro";
}

function renderTable() {
    const tbody = ensureTbody();
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!registros.length) {
        tbody.innerHTML = `
      <tr>
        <td colspan="9" class="muted">Nenhum registro salvo ainda.</td>
      </tr>`;
        return;
    }

    registros.forEach((r) => {
        const st = (r.status || "").toLowerCase();
        const badge = r.status
            ? `<span class="badge-status ${statusClass(st)}">${escapeHtml(r.status)}</span>`
            : `<span class="muted">—</span>`;

        const proc = r.protocolo ? r.protocolo : (r.processo ? r.processo : "—");
        const escola = r.escola ? r.escola : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${fmtDateTime(r.created_at || r.updated_at)}</td>
      <td>${escapeHtml(r.tema || r.tema_key || "—")}</td>
      <td>${escapeHtml(r.nome || "—")}</td>
      <td>${escapeHtml(escola)}</td>
      <td>${badge}</td>
      <td>${escapeHtml(proc)}</td>
      <td>${r.data_entrada ? fmtDate(r.data_entrada) : "—"}</td>
      <td>${r.data_saida ? fmtDate(r.data_saida) : "—"}</td>
      <td>
        <button class="btn ghost" data-edit="${r.id}" type="button">Editar</button>
        <button class="btn danger" data-del="${r.id}" type="button">Excluir</button>
      </td>
    `;

        tr.querySelector("[data-edit]")?.addEventListener("click", () => startEditById(r.id));
        tr.querySelector("[data-del]")?.addEventListener("click", () => deleteById(r.id));

        tbody.appendChild(tr);
    });
}

async function deleteById(id) {
    try {
        const { error } = await supabaseClient.from("seape_registros").delete().eq("id", id);
        if (error) throw error;

        showMsg("Registro excluído.", "ok");
        cancelEdit(true);
        await loadAndRender();
    } catch (err) {
        showMsg(`Erro ao excluir: ${err.message || err}`, "err");
    }
}

async function apagarTudoSupabase() {
    const ok = confirm("Tem certeza que deseja APAGAR TODOS os registros do SEAPE no Supabase?");
    if (!ok) return;

    try {
        const { error } = await supabaseClient
            .from("seape_registros")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) throw error;

        showMsg("Todos os registros do SEAPE foram apagados.", "ok");
        cancelEdit(true);
        await loadAndRender();
    } catch (err) {
        showMsg(`Erro ao apagar tudo: ${err.message || err}`, "err");
    }
}

async function exportarJSON() {
    try {
        const { data, error } = await supabaseClient
            .from("seape_registros")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000);

        if (error) throw error;

        const blob = new Blob([JSON.stringify(data || [], null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `seape_registros_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        showMsg("Exportação gerada (JSON).", "ok");
    } catch (err) {
        showMsg(`Erro ao exportar: ${err.message || err}`, "err");
    }
}

function validate(data) {
    if (!data.nome?.trim()) return { ok: false, msg: "Informe o nome." };

    if (data.tema_key === "EVOLUCAO_FUNCIONAL") {
        if (!data.protocolo?.trim()) return { ok: false, msg: "Informe o número de protocolo." };
        if (!data.status) return { ok: false, msg: "Selecione o status." };
        if (!data.data_entrada) return { ok: false, msg: "Informe a data de entrada." };
    }

    if (data.tema_key === "APOSENTADORIA") {
        if (!data.protocolo?.trim()) return { ok: false, msg: "Informe o número de protocolo." };
        if (!data.status) return { ok: false, msg: "Selecione o status." };
    }

    if (data.tema_key === "FAI_PUCT") {
        if (!data.processo?.trim()) return { ok: false, msg: "Informe o número do processo." };
        if (!data.escola) return { ok: false, msg: "Selecione a escola." };
        if (!data.status) return { ok: false, msg: "Selecione o status." };
    }

    return { ok: true, msg: "" };
}

function statusClass(status) {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("não") || s.includes("nao")) return "naoconcluido";
    if (s.includes("andamento") || s.includes("atendendo")) return "andamento";
    if (s.includes("concluido")) return "concluido";
    return "";
}

function ensureTbody() {
    let tbody = document.getElementById("tbodyRegistros");
    if (tbody) return tbody;

    const table = document.getElementById("tblRegistros") || document.querySelector("table.table");
    if (!table) return null;

    tbody = document.createElement("tbody");
    tbody.id = "tbodyRegistros";
    table.appendChild(tbody);
    return tbody;
}

function formToObj(form) {
    const fd = new FormData(form);
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = (v ?? "").toString().trim();
    return obj;
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val ?? "";
}

function showMsg(text, type = "") {
    const el = $("#msg");
    if (!el) return;
    el.className = "msg";
    if (type) el.classList.add(type);
    el.textContent = text || "";
}

function fieldText(name, label, required) {
    return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="text" ${required ? "required" : ""} />
    </div>
  `;
}

function fieldDate(name, label, required) {
    return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="date" ${required ? "required" : ""} />
    </div>
  `;
}

function fieldTextarea(name, label, required) {
    return `
    <div class="field">
      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" ${required ? "required" : ""}></textarea>
    </div>
  `;
}

function fieldSelect(name, label, options, required) {
    const opts = (options || [])
        .map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`)
        .join("");

    return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" ${required ? "required" : ""}>
        <option value="">Selecione...</option>
        ${opts}
      </select>
    </div>
  `;
}

function fmtDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
}

function fmtDateTime(iso) {
    if (!iso) return "—";
    const dt = new Date(iso);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    const hh = String(dt.getHours()).padStart(2, "0");
    const mi = String(dt.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

function escapeHtml(str) {
    return (str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
    return escapeHtml(str).replaceAll('"', "&quot;");
}
