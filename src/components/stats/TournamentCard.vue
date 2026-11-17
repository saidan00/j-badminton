<script setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import CopyImageButton from '@/components/CopyImageButton.vue';
import ChevronIcon from '@/components/icons/ChevronIcon.vue';
import { LOGO_URL } from '@/config.js';
import { fmtDate, titleOf, winnerSide } from '@/lib/stats.js';
import { renderTournament } from '@/lib/statsCard.js';
import MatchRow from './MatchRow.vue';
import PlayerNames from './PlayerNames.vue';

const props = defineProps({
  tournament: { type: Object, required: true },
  open: Boolean,
});

const { t } = useI18n();
const nameOf = inject('nameOf');
const SIDES = ['a', 'b'];

const result = computed(() => props.tournament.result);
// Giải chia bảng: vòng bảng + loại trực tiếp; còn lại là 2 đội đấu nhiều trận.
const isGroups = computed(() => props.tournament.format === 'groups');
const finalScore = computed(() => {
  const m = result.value.final;
  if (!m) return '';
  const [win, lose] = winnerSide(m) === 'a' ? m.score : [...m.score].reverse();
  return `${win}–${lose}`;
});

// Chấm T/B của từng trận vòng bảng; rê chuột (hoặc chạm trên điện thoại) xem đối thủ và tỉ số.
const formResult = (r) => t(r.won ? 'stats.detail.won' : 'stats.detail.lost');
// Câu đầy đủ cho trình đọc màn hình; tooltip hiện "Thua  Chín  16–21" với mỗi đối thủ một dòng.
const formTip = (r) => t('stats.history.formTip', {
  result: formResult(r),
  opponents: r.opp.map(nameOf).join(' & '),
  score: r.score.join('–'),
});

const renderImage = () => renderTournament(props.tournament, { nameOf, logoSrc: LOGO_URL });
</script>

<!-- Nút copy nằm ngoài <details> để vẫn bấm được khi thẻ đang đóng, và không bấm nhầm thành mở/đóng thẻ. -->
<template>
  <div class="tourney-wrap">
    <details class="card tourney" :open="open">
      <summary class="board">
        <div class="board-top">
          <span>{{ titleOf(tournament) }}<template v-if="!isGroups && !result.winner"> · <b>{{ t('stats.history.draw') }}</b></template></span>
          <span class="board-date">{{ fmtDate(tournament.date) }}
            <ChevronIcon />
          </span>
        </div>

        <div v-if="isGroups" class="champ">
          <span class="champ-label">🏆 {{ t('stats.history.champion') }}</span>
          <span class="champ-names">
            <PlayerNames v-if="result.champion" :ids="result.champion" stack />
            <template v-else>—</template>
          </span>
          <i18n-t v-if="result.final" keypath="stats.history.finalLine" tag="small" class="champ-final">
            <template #score>{{ finalScore }}</template>
            <template #opponents>
              <PlayerNames :ids="result.runnerUp" />
            </template>
          </i18n-t>
        </div>

        <div v-else class="teams">
          <template v-for="(side, i) in SIDES" :key="side">
            <div v-if="i > 0" class="net"></div>
            <div class="team" :class="[`team--${side}`, {
              'is-win': result.winner === side,
              'is-lose': result.winner && result.winner !== side,
            }]">
              <div class="team-name">
                {{ tournament.teams?.[side] ?? t('stats.history.team', { side: side.toUpperCase() }) }}
                <small>
                  <PlayerNames :ids="[...result.rosters[side]]" sep=" · " />
                </small>
              </div>
              <div class="score">{{ result.wins[side] }}</div>
              <span v-if="result.winner === side" class="win-tag">{{ t('stats.history.win') }}</span>
            </div>
          </template>
        </div>
      </summary>

      <div v-if="isGroups" class="stages">
        <section v-for="g in result.groups" :key="g.name">
          <h3 class="stage-title">
            {{ t('stats.stage.group', { group: g.name }) }}
            <span>{{ t('stats.history.standings') }}</span>
          </h3>
          <ol class="standings">
            <li v-for="(row, i) in g.rows" :key="row.pair.join()" :class="{ 'is-through': row.through }"
              :title="row.through ? t('stats.history.through') : undefined">
              <span class="st-rank">{{ i + 1 }}</span>
              <span class="st-pair">
                <PlayerNames :ids="row.pair" stack />
              </span>
              <span class="st-form">
                <button v-for="(r, k) in row.results" :key="k" type="button" class="form-dot"
                  :class="{ win: r.won }" :aria-label="formTip(r)">
                  {{ t(r.won ? 'stats.detail.wonShort' : 'stats.detail.lostShort') }}
                  <span class="form-tip" aria-hidden="true">
                    <span class="tip-result">{{ formResult(r) }}</span>
                    <span class="tip-names">
                      <PlayerNames :ids="r.opp" stack />
                    </span>
                    <span class="tip-score">{{ r.score.join('–') }}</span>
                  </span>
                </button>
              </span>
              <span class="st-won">{{ row.won }}</span>
            </li>
          </ol>
          <ol class="matches">
            <MatchRow v-for="(m, i) in g.matches" :key="i" :match="m" :no="i + 1" />
          </ol>
        </section>
        <section v-if="result.knockout.length">
          <h3 class="stage-title">{{ t('stats.history.knockout') }}</h3>
          <ol class="matches">
            <MatchRow v-for="(m, i) in result.knockout" :key="i" :match="m" :note="t(`stats.stage.${m.stage}`)" />
          </ol>
        </section>
      </div>

      <ol v-else class="matches matches--teams">
        <MatchRow v-for="(m, i) in tournament.matches" :key="i" :match="m" :no="i + 1"
          :note="m.decider ? t('stats.history.decider') : ''" />
      </ol>
    </details>
    <CopyImageButton class="tourney-copy" dark :render="renderImage" :label="t('stats.copy.tournament')"
      :filename="t('stats.copy.tournamentFile', { id: tournament.id ?? tournament.date })" />
  </div>
</template>

<style scoped>
.tourney-wrap {
  position: relative;
}

.tourney-copy {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 32px;
  height: 32px;
}

/* Chừa chỗ cho nút copy ở góc phải hàng tiêu đề */
.tourney .board-top {
  padding-right: 40px;
}

.tourney>summary {
  list-style: none;
  cursor: pointer;
}

.tourney>summary::-webkit-details-marker {
  display: none;
}

.tourney>summary:focus-visible {
  outline: 3px solid var(--lime);
  outline-offset: -3px;
  border-radius: var(--radius);
}

.board-top b {
  color: var(--lime);
  font-weight: 700;
}

.board-date {
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: .08em;
  font-variant-numeric: tabular-nums;
}

.board .chev {
  color: rgba(255, 255, 255, .6);
}

.tourney[open] .chev {
  transform: rotate(180deg);
}

.team--a {
  --c: var(--team-a);
}

.team--b {
  --c: var(--team-b);
}

.team-name small {
  line-height: 1.45;
  text-wrap: balance;
}

.team.is-lose .score {
  opacity: .4;
  text-shadow: none;
}

.win-tag {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--lime);
  color: var(--lime-ink);
  font: 800 13px/1 var(--display);
  letter-spacing: .14em;
  text-transform: uppercase;
}

/* Nhà vô địch trên bảng tối của giải chia bảng */
.champ {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 20px 0 4px;
  text-align: center;
}

.champ-label {
  font: 800 14px/1 var(--display);
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--lime);
}

.champ-names {
  font: 800 clamp(30px, 8vw, 44px)/1.05 var(--display);
  letter-spacing: .04em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 0 26px rgba(216, 255, 60, .35);
  text-wrap: balance;
}

.champ-final {
  font: 500 13px/1.35 var(--body);
  color: rgba(255, 255, 255, .6);
}

.matches {
  list-style: none;
  padding: 8px 18px 14px;
}

.matches--teams {
  --win-a: var(--team-a-ink);
  --win-b: var(--team-b-ink);
}

.stages {
  display: grid;
  gap: 8px;
  padding: 6px 18px 16px;
}

.stages .matches {
  padding: 4px 0 0;
}

.stage-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin: 12px 0 10px;
  font: 800 18px/1 var(--display);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.stage-title span {
  font: 600 12px/1 var(--body);
  letter-spacing: .02em;
  text-transform: none;
  color: var(--muted);
}

.standings {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 6px;
}

.standings li {
  display: grid;
  /* Cột tên cố định để chuỗi T/B thẳng hàng giữa các cặp */
  grid-template-columns: 18px minmax(0, 104px) 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  background: var(--paper-2);
  font: 600 14px/1.25 var(--body);
}

.standings li.is-through {
  background: color-mix(in srgb, var(--lime) 30%, #fff);
}

.st-rank {
  font: 700 14px/1 var(--display);
  color: var(--muted);
}

.st-form {
  position: relative;
  display: flex;
  gap: 5px;
}

.form-dot {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1.5px solid color-mix(in srgb, var(--muted) 45%, transparent);
  border-radius: 50%;
  background: transparent;
  font: 700 12px/1 var(--display);
  color: var(--muted);
  cursor: pointer;
}

.form-dot.win {
  border-color: var(--court-hi);
  background: var(--court-hi);
  color: #fff;
}

.form-dot:hover,
.form-dot:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* Tooltip tự vẽ (title của trình duyệt hiện chậm và không có trên điện thoại), nằm ngay trên chấm:
   kết quả | tên đối thủ mỗi người một dòng | tỉ số. */
.form-tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  column-gap: 8px;
  width: max-content;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--ink);
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, .4);
  font: 600 12px/1.35 var(--body);
  color: #fff;
  text-align: left;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition: opacity .12s, transform .12s;
  z-index: 3;
}

.tip-result {
  color: rgba(255, 255, 255, .65);
}

.form-dot.win .tip-result {
  color: var(--lime);
}

.tip-score {
  font: 700 13px/1.35 var(--display);
  font-variant-numeric: tabular-nums;
}

.form-dot:hover .form-tip,
.form-dot:focus .form-tip {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* Màn hẹp: chấm nằm sát mép phải, neo tooltip vào mép phải cột chấm để không tràn khỏi thẻ */
@media (max-width: 420px) {
  .form-dot {
    position: static;
  }

  .form-tip {
    left: auto;
    right: 0;
    transform: translateY(4px);
  }

  .form-dot:hover .form-tip,
  .form-dot:focus .form-tip {
    transform: none;
  }
}

.st-won {
  font: 700 22px/1 var(--display);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 420px) {
  .matches {
    padding: 6px 14px 12px;
  }

  .stages {
    padding: 4px 14px 14px;
  }
}
</style>
