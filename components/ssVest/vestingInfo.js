import { Paper, Typography } from "@mui/material";
import classes from "./ssVest.module.css";
import moment from "moment";
import { formatCurrency } from "../../utils";
import BigNumber from "bignumber.js";
import { useAppThemeContext } from "../../ui/AppThemeProvider";
import Borders from "../../ui/Borders";

export default function VestingInfo({
  currentNFT,
  futureNFT,
  veToken,
  govToken,
  showVestingStructure,
}) {
  const { appTheme } = useAppThemeContext();

  return (
    <div className={classes.vestInfoContainer}>
      {currentNFT && (
        <>
          <div
            style={{
              marginTop: 20,
              // border: appTheme === 'dark' ? '1px solid #855f5f' : '1px solid #86B9D6',
            }}
            className={[
              classes.vestInfo,
              classes[`vestInfoBg--${appTheme}`],
            ].join(" ")}
          >
            <div
              className={[
                classes.vestInfoText,
                "g-flex-column",
                classes.priceInfo,
                classes[`priceInfo--${appTheme}`],
              ].join(" ")}
            >
              <Borders
                offsetLeft={-1}
                offsetRight={-1}
                offsetTop={-1}
                offsetBottom={-1}
              />
              <Typography
                className={[
                  classes.amount,
                  classes[`amount--${appTheme}`],
                ].join(" ")}
              >
                >{formatCurrency(currentNFT?.lockValue)}{" "}
                <span style={{ fontSize: 14 }}>{veToken?.symbol}</span>
              </Typography>

              <Typography
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                Voting power
              </Typography>
            </div>

            <div
              className={[
                classes.vestInfoText,
                classes.vestInfoTextSec,
                "g-flex-column",
                classes.priceInfo,
                classes[`priceInfo--${appTheme}`],
              ].join(" ")}
            >
              <Borders
                offsetLeft={-1}
                offsetRight={-1}
                offsetTop={-1}
                offsetBottom={-1}
              />
              <Typography
                style={{
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                {/* {formatCurrency(currentNFT.lockAmount)} {govToken?.symbol} locked */}
                expires {moment.unix(currentNFT?.lockEnds).fromNow()}
              </Typography>

              <Typography
                style={{
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                until {moment.unix(currentNFT?.lockEnds).format("YYYY/MM/DD")}
              </Typography>
            </div>
          </div>
        </>
      )}
      {futureNFT && (
        <>
          <div
            style={{
              marginTop: 20,
              // border: appTheme === 'dark' ? '1px solid #855f5f' : '1px solid #86B9D6',
            }}
            className={[
              classes.vestInfo,
              classes[`vestInfoBg--${appTheme}`],
            ].join(" ")}
          >
            <div
              className={[
                classes.vestInfoText,
                "g-flex-column",
                classes.priceInfo,
                classes[`priceInfo--${appTheme}`],
              ].join(" ")}
            >
              <Borders
                offsetLeft={-1}
                offsetRight={-1}
                offsetTop={-1}
                offsetBottom={-1}
              />
              <Typography
                className={[
                  classes.amount,
                  classes[`amount--${appTheme}`],
                ].join(" ")}
              >
                {formatCurrency(futureNFT?.lockValue)}{" "}
                <span style={{ fontSize: 14 }}>{veToken?.symbol}</span>
              </Typography>

              <Typography
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                Voting power
              </Typography>
            </div>

            <div
              className={[
                classes.vestInfoText,
                classes.vestInfoTextSec,
                "g-flex-column",
                classes.priceInfo,
                classes[`priceInfo--${appTheme}`],
              ].join(" ")}
            >
              <Borders
                offsetLeft={-1}
                offsetRight={-1}
                offsetTop={-1}
                offsetBottom={-1}
              />
              <Typography
                style={{
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                {/* {formatCurrency(futureNFT.lockAmount)} {govToken?.symbol} locked */}
                expires {moment.unix(futureNFT?.lockEnds).fromNow()}
              </Typography>

              <Typography
                style={{
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "120%",
                  color: appTheme === "dark" ? "#FFFFFF" : "#0A2C40",
                }}
              >
                until {moment.unix(futureNFT?.lockEnds).format("YYYY/MM/DD")}
              </Typography>
            </div>
          </div>
        </>
      )}
      {showVestingStructure && (
        <div className={classes.seccondSection}>
          <Typography
            className={[classes.info, classes[`info--${appTheme}`]].join(" ")}
            color="textSecondary"
          >
            1 {govToken?.symbol} locked for 2 weeks = 0.25 {veToken?.symbol}
          </Typography>
        </div>
      )}
    </div>
  );
}
