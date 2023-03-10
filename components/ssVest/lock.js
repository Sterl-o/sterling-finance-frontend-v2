import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  IconButton, InputBase,
} from '@mui/material';
import { useRouter } from 'next/router';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency, formatInputAmount } from '../../utils';
import classes from "./ssVest.module.css";
import stores from '../../stores';
import {
  ACTIONS,
} from '../../stores/constants';
import { EIGHT_WEEKS } from './existingLock';

import { ArrowBack, ArrowBackIosNew } from '@mui/icons-material';
import VestingInfo from "./vestingInfo";
import { useAppThemeContext } from '../../ui/AppThemeProvider';
import SwapIconBg from '../../ui/SwapIconBg';

export default function ssLock({govToken, veToken}) {
  const unixWeek = 604800

  const inputEl = useRef(null);
  const router = useRouter();

  const [lockLoading, setLockLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment.unix(Math.floor(moment().add(7, 'days').unix() / unixWeek) * unixWeek).format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  const isDateCorrect = (dateStr) => {
    const date = moment(dateStr).format('YYYY-MM-DD')
    const correctDate = moment.unix(Math.floor(moment(dateStr).add(1, 'days').unix() / unixWeek) * unixWeek).format('YYYY-MM-DD')
    return date === correctDate && moment(dateStr).unix() > moment().unix()
  }

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false);
      router.push('/vest');
    };
    const errorReturned = () => {
      setLockLoading(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    };
  }, []);

  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth);
  });

  const setAmountPercent = (percent) => {
    setAmount(BigNumber(govToken.balance).times(percent).div(100).toFixed(govToken.decimals));
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  };

  const handleChange = (value) => {
    setSelectedValue(value);

    let days = 0;
    switch (value) {
      case 'two_weeks':
        days = 14;
        break;
      case 'four_weeks':
        days = 28;
        break;
      case 'six_weeks':
        days = 42;
        break;
      case 'eight_weeks':
        days = 56;
        break;
      default:
    }
    let newDate = moment().add(days, 'days')/*.format('YYYY-MM-DD')*/;
    // round to weeks
    newDate = moment.unix(Math.floor(newDate.unix() / unixWeek) * unixWeek)

    setSelectedDate(newDate.format('YYYY-MM-DD'));
  };

  const onLock = () => {
    setAmountError(false);

    let error = false;

    if (!amount || amount === '' || isNaN(amount)) {
      setAmountError('Amount is required');
      error = true;
    } else {
      if (!govToken.balance || isNaN(govToken.balance) || BigNumber(govToken.balance).lte(0)) {
        setAmountError('Invalid balance');
        error = true;
      } else if (BigNumber(amount).lte(0)) {
        setAmountError('Invalid amount');
        error = true;
      } else if (govToken && BigNumber(amount).gt(govToken.balance)) {
        setAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!error) {
      setLockLoading(true);

      const now = moment();
      const expiry = moment(selectedDate).add(1, 'days');
      const secondsToExpire = expiry.diff(now, 'seconds');

      stores.dispatcher.dispatch({type: ACTIONS.CREATE_VEST, content: {amount, unlockTime: secondsToExpire}});
    }
  };

  const focus = () => {
    inputEl.current.focus();
  };

  const onAmountChanged = (event) => {
    const value = formatInputAmount(event.target.value.replace(',', '.'))
    setAmountError(false);
    setAmount(value);
  };

  const renderMassiveDateInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={[classes.textField, classes[`textFieldDate--${appTheme}`]].join(' ')}>
        <div className={`${classes.massiveInputContainer} ${(amountError) && classes.error}`}>
          <div className={classes.massiveInputAssetSelect}>
            <div className={classes.displaySelectContainerDate}>
              <div
                className={[classes.displayDualIconContainer, classes[`displayDualIconContainer--${appTheme}`]].join(' ')}>
                <SwapIconBg/>
                <div className={[classes.displayAssetIcon, classes[`displayAssetIcon--${appTheme}`]].join(' ')}/>
              </div>
            </div>
          </div>

          <InputBase
            className={classes.massiveInputAmountDate}
            inputRef={inputEl}
            id="someDate"
            type="date"
            placeholder="Lock Expiry Date"
            error={amountError}
            helperText={amountError}
            value={amountValue}
            onChange={amountChanged}
            disabled={lockLoading}
            inputProps={{
              className: [classes.largeInput, classes[`largeInput--${appTheme}`]].join(" "),
              min: moment().add(7, 'days').format('YYYY-MM-DD'),
              max: moment().add(EIGHT_WEEKS, 'days').format('YYYY-MM-DD'),
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />

          <Typography
            className={[classes.smallerTextDate, classes[`smallerTextDate--${appTheme}`]].join(" ")}>
            Lock Expiry Date
          </Typography>
        </div>
      </div>
    );
  };

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, token) => {
    return (
      <div className={[classes.textField, classes[`textField--${appTheme}`]].join(' ')}>
        <Typography className={classes.inputTitleText} noWrap>
          {windowWidth > 530 ? 'Manage Lock' : 'Lock'}
        </Typography>

        <Typography className={classes.inputBalanceText} noWrap onClick={() => {
          setAmountPercent(100);
        }}>
          Balance: {(token && token.balance) ? ' ' + formatCurrency(token.balance) : ''}
        </Typography>

        <div className={`${classes.massiveInputContainer} ${(amountError) && classes.error}`}>
          <div className={classes.massiveInputAssetSelect}>
            <div className={classes.displaySelectContainer}>
              <div
                className={[classes.displayDualIconContainer, classes[`displayDualIconContainer--${appTheme}`]].join(' ')}>
                <SwapIconBg/>
                {
                  token && token.logoURI &&
                  <img
                    className={classes.displayAssetIcon}
                    alt=""
                    src={token.logoURI}
                    height="100px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                    }}
                  />
                }
                {
                  !(token && token.logoURI) &&
                  <img
                    className={classes.displayAssetIcon}
                    alt=""
                    src={`/tokens/unknown-logo--${appTheme}.svg`}
                    height="100px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                    }}
                  />
                }
              </div>
            </div>
          </div>

          <InputBase
            className={classes.massiveInputAmount}
            placeholder="0.00"
            error={amountError}
            helperText={amountError}
            value={amountValue}
            onChange={amountChanged}
            disabled={lockLoading}
            inputProps={{
              className: [classes.largeInput, classes[`largeInput--${appTheme}`]].join(" "),
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />

          <Typography
            className={[classes.smallerText, classes[`smallerText--${appTheme}`]].join(" ")}>
            {token?.symbol}
          </Typography>
        </div>
      </div>
    );
  };

  const renderVestInformation = () => {
    const now = moment();
    const expiry = moment(selectedDate);
    const dayToExpire = expiry.diff(now, 'days');

    const tmpNFT = {
      lockAmount: amount,
      lockValue: BigNumber(amount).times(parseInt(dayToExpire) + 1).div(EIGHT_WEEKS).toFixed(18),
      lockEnds: expiry.unix(),
    };

    return (<VestingInfo futureNFT={tmpNFT} govToken={govToken} veToken={veToken} showVestingStructure={true}/>);
  };

  const onBack = () => {
    router.push('/vest');
  };

  const {appTheme} = useAppThemeContext();

  let buttonText = 'Lock Tokens & Get veSTR';
  if (lockLoading) {
    buttonText = 'Locking'
  } else if (amount === '' || Number(amount) === 0) {
    buttonText = 'Enter amount'
  } else if (!isDateCorrect(selectedDate)) {
    buttonText = 'Wrong expiration date'
  }

  return (
    <>
      <Paper
        elevation={0}
        className={[classes.container3, classes[`container3--${appTheme}`, 'g-flex-column']].join(' ')}>
        <div
          className={[classes.titleSection, classes[`titleSection--${appTheme}`]].join(' ')}>
          <Tooltip title="Back to Vest" placement="top">
            <IconButton onClick={onBack}>
              <ArrowBackIosNew className={[classes.backIcon, classes[`backIcon--${appTheme}`]].join(' ')}/>
            </IconButton>
          </Tooltip>
        </div>

        <div className={[classes[`top`], classes[`top--${appTheme}`]].join(' ')}>
        </div>

        <div className={[classes.reAddPadding3, classes[`reAddPadding3--${appTheme}`]].join(' ')}>
          {renderMassiveInput('amount', amount, amountError, onAmountChanged, govToken)}

          {amountError && <div
                style={{ marginTop: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError].join(" ")}>
                <div className={[
                  classes.warningDivider,
                  classes.warningDividerError
                ].join(" ")}>
                </div>
                <Typography
                  className={[classes.warningError, classes[`warningText--${appTheme}`]].join(" ")}
                  align="center">{amountError}</Typography>
              </div>}

          <div>
            {renderMassiveDateInput('date', selectedDate, selectedDateError, handleDateChange, govToken?.balance, govToken?.logoURI)}

            {selectedDateError && <div
                style={{ marginTop: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError].join(" ")}>
                <div className={[
                  classes.warningDivider,
                  classes.warningDividerError
                ].join(" ")}>
                </div>
                <Typography
                  className={[classes.warningError, classes[`warningText--${appTheme}`]].join(" ")}
                  align="center">{selectedDateError}</Typography>
              </div>}

            <div
              className={[classes.vestPeriodToggle, classes[`vestPeriodToggle--${appTheme}`], 'g-flex', 'g-flex--align-center', 'g-flex--space-between'].join(' ')}>
              <div
                className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${appTheme}`], classes[`vestPeriodLabel--${selectedValue === 'two_weeks' ? 'checked' : ''}`]].join(' ')}
                onClick={() => handleChange('two_weeks')}>
                2 weeks
              </div>

              <div
                className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${appTheme}`], classes[`vestPeriodLabel--${selectedValue === 'four_weeks' ? 'checked' : ''}`]].join(' ')}
                onClick={() => handleChange('four_weeks')}>
                4 weeks
              </div>

              <div
                className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${appTheme}`], classes[`vestPeriodLabel--${selectedValue === 'six_weeks' ? 'checked' : ''}`]].join(' ')}
                onClick={() => handleChange('six_weeks')}>
                6 weeks
              </div>

              <div
                className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${appTheme}`], classes[`vestPeriodLabel--${selectedValue === 'eight_weeks' ? 'checked' : ''}`]].join(' ')}
                onClick={() => handleChange('eight_weeks')}>
                8 weeks
              </div>
            </div>
          </div>
          <Typography
              className={[classes.info, classes[`info--${appTheme}`], classes[`info--lock-period`]].join(" ")}
              color="textSecondary"
          >
            Lock period should be multiples of 1 week <br/>(e.g. 28, 35, 42 days, etc.)
          </Typography>
          {renderVestInformation()}
        </div>

        <Button
          className={[classes.buttonOverride, classes[`buttonOverride--${appTheme}`]].join(' ')}
          fullWidth
          variant="contained"
          size="large"
          color="primary"
          disabled={lockLoading || amount === '' || Number(amount) === 0 || !isDateCorrect(selectedDate)}
          onClick={onLock}>
          <Typography className={classes.actionButtonText}>
            {buttonText}
          </Typography>

          {lockLoading && <CircularProgress size={10} className={classes.loadingCircle}/>}
        </Button>
      </Paper>
    </>
  );
}
