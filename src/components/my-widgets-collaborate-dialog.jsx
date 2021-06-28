import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { apiGetUsers, apiSearchUsers } from '../util/api'
import setUserInstancePerms from './hooks/useSetUserInstancePerms'
import Modal from './modal'
import useDebounce from './hooks/useDebounce'
import LoadingIcon from './loading-icon'
import NoContentIcon from './no-content-icon'
import CollaborateUserRow from './my-widgets-collaborate-user-row'
import './my-widgets-collaborate-dialog.scss'

const initDialogState = () => {
	return ({
		searchText: '',
		shareNotAllowed: false,
		updatedOtherUserPerms: {}
	})
}

const MyWidgetsCollaborateDialog = ({onClose, inst, myPerms, otherUserPerms, setOtherUserPerms, currentUser}) => {
	const [state, setState] = useState(initDialogState())
	const debouncedSearchTerm = useDebounce(state.searchText, 250)
	const queryClient = useQueryClient()
	const setUserPerms = setUserInstancePerms()
	const mounted = useRef(false)
	const popperRef = useRef(null)
	const { data: collabUsers, remove: clearUsers, isFetching} = useQuery({
		queryKey: ['collab-users', inst.id],
		enabled: !!otherUserPerms,
		queryFn: () => apiGetUsers(Array.from(otherUserPerms.keys())),
		staleTime: Infinity,
		placeholderData: {}
	})
	const { data: searchResults, remove: clearSearch, refetch: refetchSearch } = useQuery({
		queryKey: `user-search`,
		enabled: !!debouncedSearchTerm,
		queryFn: () => apiSearchUsers(debouncedSearchTerm),
		staleTime: Infinity,
		placeholderData: [],
		retry: false
	})
	
	useEffect(() => {
    mounted.current = true
    return () => {
			mounted.current = false
		}
	}, [])

	// Handles the search with debounce
	useEffect(() => {
		if(debouncedSearchTerm === '') clearSearch()
		else refetchSearch()
	}, [debouncedSearchTerm])

	// Sets Perms
	useEffect(() => {
		const map = new Map(otherUserPerms)
		map.forEach(key => key.remove = false)
		setState({...state, updatedOtherUserPerms: map})
	}, [otherUserPerms])

	// Handles clicking a search result
	const onClickMatch = (match) => {
		const tempPerms = state.updatedOtherUserPerms
		let shareNotAllowed = false

		if(!inst.guest_access && match.is_student){
			shareNotAllowed = true
			setState({...state, searchText: '', updatedOtherUserPerms: tempPerms, shareNotAllowed: shareNotAllowed})
			return
		}

		if(!(match.id in collabUsers) || state.updatedOtherUserPerms.get(match.id).remove === true) 
		{
			// Adds user to query data
			let tmpMatch = {}
			tmpMatch[match.id] = match
			queryClient.setQueryData(['collab-users', inst.id], old => ({...old, ...tmpMatch}))

			// Updateds the perms
			tempPerms.set(
				match.id, 
				{
					accessLevel: 1,
					expireTime: null,
					editable: false,
					shareable: false,
					can: {
						view: true,
						copy: false, 
						edit: false,
						delete: false, 
						share: false
					},
					remove: false
				}
			)
		}

		setState({...state, searchText: '', updatedOtherUserPerms: tempPerms, shareNotAllowed: shareNotAllowed})
	}

	const containsUser = useMemo(() => {
		for (const [id, val] of Array.from(state.updatedOtherUserPerms)) {
			if(val.remove === false) return true
		}

		return false
	},[inst, Array.from(state.updatedOtherUserPerms)])

	const onSave = () => {
		let isCurrUser = false
		if (state.updatedOtherUserPerms.get(currentUser.id)?.remove) {
			isCurrUser = true
		}
		
		setUserPerms.mutate({
			instId: inst.id, 
			permsObj: Array.from(state.updatedOtherUserPerms).map(([userId, userPerms]) => {
				return {
					user_id: userId,
					expiration: userPerms.expireTime,
					perms: {[userPerms.accessLevel]: !userPerms.remove}
				}
			}),
			successFunc: () => {
				if (mounted.current) {
					setOtherUserPerms(state.updatedOtherUserPerms)
					if (isCurrUser) {
						queryClient.invalidateQueries('widgets')
					}
					queryClient.invalidateQueries('search-widgets')
					queryClient.invalidateQueries(['user-perms', inst.id])
					queryClient.invalidateQueries(['user-search', inst.id])
					queryClient.removeQueries(['collab-users', inst.id])
					customClose()
				}
			}
		})

		state.updatedOtherUserPerms.forEach((value, key) => {
			if(value.remove === true) {
				state.updatedOtherUserPerms.delete(key)
			}
		})
	}

	const customClose = () => {
		clearUsers()
		clearSearch()
		onClose()
	}

	const updatePerms = (userId, perms) => {
		let newPerms = new Map(state.updatedOtherUserPerms)
		newPerms.set(userId, perms)
		setState({...state, updatedOtherUserPerms: newPerms})
	}

	return (
		<Modal onClose={customClose} ignoreClose={state.shareNotAllowed}>
			<div className="collaborate-modal" ref={popperRef}>
				<span className="title">Collaborate</span>
				<div>
					<div id="access" className="collab-container">
							{ //cannot search unless you have full access
								myPerms?.shareable
								? 
									<div className="search-container">
										<span className="collab-input-label">
											Add people:
										</span>
										<input 
											tabIndex="0" 
											value={state.searchText}
											onChange={(e) => setState({...state, searchText: e.target.value})}
											className="user-add" 
											type="text" 
											placeholder="Enter a Materia user's name or e-mail"/>
										<div>
										{ debouncedSearchTerm !== '' && searchResults && searchResults?.length !== 0
											? <div className="collab-search-list">
												{searchResults?.map((match) => 
													<div
														key={match.id}
														className='collab-search-match clickable'
														onClick={() => onClickMatch(match)}>
															<img className="collab-match-avatar" src={match.avatar} />
															<p className={`collab-match-name ${match.is_student ? 'collab-match-student' : ''}`}>{match.first} {match.last}</p>
													</div>
												)}
												</div>
											: null
										}
										</div>
									</div>
								: null
							}	
						<div className={`access-list ${containsUser ? '' : 'no-content'}`}>
							{
								!isFetching
								? <>
										{
											containsUser
											? Array.from(state.updatedOtherUserPerms).map(([userId, userPerms]) => {
												if(userPerms.remove === true) return
												const user = collabUsers[userId]
												if(!user) return <div key={userId}></div>
												return <CollaborateUserRow
													key={user.id}
													user={user}
													perms={userPerms}
													isCurrentUser={currentUser.id === user.id}
													onChange={(userId, perms) => updatePerms(userId, perms)}
													readOnly={myPerms?.shareable === false}
												/>
											})
											: <NoContentIcon />
										}
									</>
								: <LoadingIcon />
							}
						</div>
						<p className="disclaimer">
							Users with full access can edit or copy this widget and can
							add or remove people in this list.
						</p>
						<div className="btn-box">
							<a tabIndex="0" className="cancel_button" onClick={customClose}>
								Cancel
							</a>
							<a tabIndex="0" className="action_button green save_button" onClick={onSave}>
								Save
							</a>
						</div>
					</div>
				</div>
			</div>
			{ state.shareNotAllowed === true
				? <Modal onClose={() => {setState({...state, shareNotAllowed: false})}} smaller={true} alert={true}>
					<span className="alert-title">Share Not Allowed</span>
					<p className="alert-description">Access must be set to "Guest Mode" to collaborate with students.</p>
					<button className="alert-btn" onClick={() => {setState({...state, shareNotAllowed: false})}}>Okay</button>
				</Modal>
				: null
			}
		</Modal>
	)
}

export default MyWidgetsCollaborateDialog
