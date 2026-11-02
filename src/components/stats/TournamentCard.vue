<script setup>
import ChevronIcon from '@/components/icons/ChevronIcon.vue';
import { fmtDate, titleOf } from '@/lib/stats.js';
import PlayerNames from './PlayerNames.vue';

defineProps({
  tournament: { type: Object, required: true },
  open: Boolean,
});

const SIDES = ['a', 'b'];
const aWon = (m) => m.score[0] > m.score[1];
</script>

<template>
  <details class="card tourney" :open="open">
    <summary class="board">
      <div class="board-top">
        <span>{{ titleOf(tournament) }}<template v-if="!tournament.result.winner"> · <b>Hoà</b></template></span>
        <span class="board-date">{{ fmtDate(tournament.date) }}
          <ChevronIcon />
        </span>
      </div>
      <div class="teams">
        <template v-for="(side, i) in SIDES" :key="side">
          <div v-if="i > 0" class="net"></div>
          <div class="team" :class="[`team--${side}`, {
            'is-win': tournament.result.winner === side,
            'is-lose': tournament.result.winner && tournament.result.winner !== side,
          }]">
            <div class="team-name">
              {{ tournament.teams?.[side] ?? `Đội ${side.toUpperCase()}` }}
              <small>
                <PlayerNames :ids="[...tournament.result.rosters[side]]" sep=" · " />
              </small>
            </div>
            <div class="score">{{ tournament.result.wins[side] }}</div>
            <span v-if="tournament.result.winner === side" class="win-tag">Thắng</span>
          </div>
        </template>
      </div>
    </summary>
    <ol class="matches">
      <li v-for="(m, i) in tournament.matches" :key="i" class="m">
        <span class="m-no">{{ i + 1 }}</span>
        <span class="m-side m-a" :class="{ win: aWon(m) }">
          <PlayerNames :ids="m.a" />
        </span>
        <span class="m-score">
          <b :class="{ win: aWon(m) }">{{ m.score[0] }}</b>–<b :class="{ win: !aWon(m) }">{{ m.score[1] }}</b>
          <small v-if="m.decider">Quyết định</small>
        </span>
        <span class="m-side m-b" :class="{ win: !aWon(m) }">
          <PlayerNames :ids="m.b" />
        </span>
      </li>
    </ol>
  </details>
</template>

<style scoped>
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

.matches {
  list-style: none;
  padding: 8px 18px 14px;
}

.m {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 56px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--rule);
  font: 500 14px/1.25 var(--body);
  color: var(--muted);
}

.m:last-child {
  border-bottom: 0;
}

.m-no {
  font: 700 13px/1 var(--display);
  opacity: .7;
}

.m-a {
  text-align: right;
}

.m-side.win {
  font-weight: 700;
}

.m-a.win {
  color: var(--team-a-ink);
}

.m-b.win {
  color: var(--team-b-ink);
}

.m-score {
  font: 700 20px/1 var(--display);
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}

.m-score b {
  font-weight: 600;
}

.m-score b.win {
  font-weight: 800;
  color: var(--ink);
}

.m-score small {
  display: block;
  margin-top: 3px;
  font: 700 10px/1 var(--body);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--court-hi);
}

@media (max-width: 420px) {
  .matches {
    padding: 6px 14px 12px;
  }

  .m {
    gap: 8px;
    font-size: 13px;
  }
}
</style>
