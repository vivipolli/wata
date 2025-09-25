export const formatHBAR = (amount: number): string => {
  return `${amount.toFixed(4)} HBAR`
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}

export const formatBalance = (balance: number): string => {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(2)}M HBAR`
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K HBAR`
  } else {
    return `${balance.toFixed(4)} HBAR`
  }
}

export const formatHash = (hash: string): string => {
  if (!hash || hash.length < 16) return hash
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
}

export const formatAddress = (address: string): string => {
  if (!address || address.length < 20) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
