use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("2B2svDpRkLgqvvMGbRqMsPqMJAXSvW9JW3HsUXrtDw8Q");

#[program]
pub mod tweetbet {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        tweet_id: u64,
        threshold: u64,
        pool_bump: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.tweet_id = tweet_id;
        pool.threshold = threshold;
        pool.total_over = 0;
        pool.total_under = 0;
        pool.final_like_count = 0;
        pool.is_settled = false;
        pool.bump = pool_bump;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        tweet_id: u64,
        is_over: bool,
        amount: u64,
        _pool_bump: u8,
        bet_bump: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_settled, PoolError::AlreadySettled);

        let bet = &mut ctx.accounts.bet;
        bet.user = *ctx.accounts.user.key;
        bet.is_over = is_over;
        bet.amount = amount;
        bet.bump = bet_bump;

        if is_over {
            pool.total_over = pool.total_over.checked_add(amount).unwrap();
        } else {
            pool.total_under = pool.total_under.checked_add(amount).unwrap();
        }

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.pool.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn update_likes(
        ctx: Context<UpdateLikes>,
        _tweet_id: u64,
        like_count: u64,
    ) -> Result<()> {
        ctx.accounts.pool.final_like_count = like_count;
        Ok(())
    }

    pub fn settle_pool(
        ctx: Context<SettlePool>,
        _tweet_id: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_settled, PoolError::AlreadySettled);
        pool.is_settled = true;
        Ok(())
    }

    pub fn claim_bet(
        ctx: Context<ClaimBet>,
        _tweet_id: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let bet = &mut ctx.accounts.bet;

        require!(pool.is_settled, PoolError::NotYetSettled);

        let win = if bet.is_over {
            pool.final_like_count > pool.threshold
        } else {
            pool.final_like_count < pool.threshold
        };
        require!(win, PoolError::LostBet);

        let winners_pool = if bet.is_over {
            pool.total_over
        } else {
            pool.total_under
        };
        let total_pool = pool.total_over.checked_add(pool.total_under).unwrap();
        let payout = bet
            .amount
            .checked_mul(total_pool)
            .unwrap()
            .checked_div(winners_pool)
            .unwrap();

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.pool.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, payout)?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(tweet_id: u64, threshold: u64, pool_bump: u8)]
pub struct InitializePool<'info> {
    #[account(
        init,
        seeds = [b"pool".as_ref(), tweet_id.to_le_bytes().as_ref()],
        bump,
        payer = user,
        space = 8 + Pool::LEN
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tweet_id: u64, is_over: bool, amount: u64, _pool_bump: u8, bet_bump: u8)]
pub struct PlaceBet<'info> {
    #[account(
        mut,
        seeds = [b"pool".as_ref(), tweet_id.to_le_bytes().as_ref()],
        bump = _pool_bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
        init,
        seeds = [
          b"bet".as_ref(),
          tweet_id.to_le_bytes().as_ref(),
          user.key().as_ref()
        ],
        bump,
        payer = user,
        space = 8 + Bet::LEN
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tweet_id: u64, pool_bump: u8)]
pub struct UpdateLikes<'info> {
    #[account(
        mut,
        seeds = [b"pool".as_ref(), tweet_id.to_le_bytes().as_ref()],
        bump = pool_bump
    )]
    pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
#[instruction(tweet_id: u64, pool_bump: u8)]
pub struct SettlePool<'info> {
    #[account(
        mut,
        seeds = [b"pool".as_ref(), tweet_id.to_le_bytes().as_ref()],
        bump = pool_bump
    )]
    pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
#[instruction(tweet_id: u64, pool_bump: u8)]
pub struct ClaimBet<'info> {
    #[account(
        mut,
        seeds = [b"pool".as_ref(), tweet_id.to_le_bytes().as_ref()],
        bump = pool_bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
        mut,
        seeds = [
          b"bet".as_ref(),
          tweet_id.to_le_bytes().as_ref(),
          user.key().as_ref()
        ],
        bump = bet.bump,
        close = user
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Pool {
    pub tweet_id: u64,
    pub threshold: u64,
    pub total_over: u64,
    pub total_under: u64,
    pub final_like_count: u64,
    pub is_settled: bool,
    pub bump: u8,
}
impl Pool { const LEN: usize = 8*6 + 1; }

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub is_over: bool,
    pub amount: u64,
    pub bump: u8,
}
impl Bet { const LEN: usize = 32 + 1 + 8 + 1; }

#[error_code]
pub enum PoolError {
    #[msg("Pool has already been settled")]
    AlreadySettled,
    #[msg("Pool is not yet settled")]
    NotYetSettled,
    #[msg("You lost this bet")]
    LostBet,
}
