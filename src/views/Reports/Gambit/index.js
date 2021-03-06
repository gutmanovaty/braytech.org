import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { t } from '../../../utils/i18n';
import { GetHistoricalStats } from '../../../utils/bungie';
import { DestinyActivityModeType } from '../../../utils/destinyEnums';
import { useInterval } from '../../../utils/hooks';

import Spinner from '../../../components/UI/Spinner';
import Mode from '../../../components/Reports/Mode';
import Matches from '../../../components/Reports/Matches';

async function getStats(member) {
  const stats = {
    all: {
      pvecomp_mamba: {
        mode: DestinyActivityModeType.GambitPrime,
      },
      pvecomp_gambit: {
        mode: DestinyActivityModeType.Gambit,
      },
      enigma: {
        mode: DestinyActivityModeType.Reckoning,
      },
    },
  };

  let [stats_all] = await Promise.all([
    GetHistoricalStats(
      member.membershipType,
      member.membershipId,
      member.characterId,
      '1',
      Object.values(stats.all).map((m) => m.mode),
      '0'
    ),
  ]);

  stats_all = (stats_all && stats_all.ErrorCode === 1 && stats_all.Response) || [];

  for (const mode in stats_all) {
    if (stats_all.hasOwnProperty(mode)) {
      if (!stats_all[mode].allTime) {
        continue;
      }

      Object.entries(stats_all[mode].allTime).forEach(([key, value]) => {
        stats.all[mode][key] = value;
      });
    }
  }

  return stats;
}

export default function Crucible(props) {
  const member = useSelector((state) => state.member);

  const [state, setState] = useState({
    loading: true,
    stats: undefined,
  });

  async function updateStats() {
    const { membershipType, membershipId, characterId } = member;

    setState((state) => ({
      ...state,
      loading: true,
    }));

    const stats = await getStats({
      membershipType,
      membershipId,
      characterId,
    });

    setState({
      loading: false,
      stats,
    });
  }

  useEffect(() => {
    if (!state.stats) {
      updateStats();
    }
  }, []);

  useInterval(() => {
    if (!state.loading) {
      updateStats();
    }
  }, 60000);

  return (
    <div className='type'>
      {state.stats ? (
        <div className='modes'>
          <div className='sub-header'>
            <div>{t('Modes')}</div>
          </div>
          <div className='content'>
            <ul className='list modes'>
              {Object.values(state.stats.all).map((m) => (
                <Mode key={m.mode} stats={m} root='/reports/gambit' defaultMode={DestinyActivityModeType.GambitPrime} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className='modes loading'>
          <Spinner />
        </div>
      )}
      <Matches mode={props.mode || DestinyActivityModeType.GambitPrime} limit='10' offset={props.offset} root='/reports/gambit' />
    </div>
  );
}
