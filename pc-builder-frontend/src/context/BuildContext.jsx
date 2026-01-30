// src/context/BuildContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';

const BuildContext = createContext(null);

export const useBuild = () => useContext(BuildContext);

const getBuildId = (build) => build?._id || build?.id;
const getUserId = (user) => user?.id || user?._id || user?.user_id;

export const BuildProvider = ({ children }) => {
    const [currentBuild, setCurrentBuild] = useState(null);
    const [buildDetails, setBuildDetails] = useState({ parts: [], compatibility: { status: 'success', issues: [] }, totals: { price: 0, count: 0 } });
    const [buildsList, setBuildsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isAuthenticated, user } = useAuth();

    const createNewBuild = async () => {
        const userId = getUserId(user);
        if (!userId) throw new Error('User ID not available');

        const response = await apiClient.post('/builds', {
            user_id: userId,
            name: 'My New PC Build',
            components: [],
            status: 'Draft'
        });
        return response.data;
    };

    const fetchBuildDetails = useCallback(async (buildId) => {
        if (!buildId) return null;
        try {
            const response = await apiClient.get(`/builds/${buildId}/details`);
            setBuildDetails(response.data);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch build details:', err);
            setBuildDetails({ parts: [], compatibility: { status: 'error', issues: [{ type: 'error', message: 'Failed to load build details' }] }, totals: { price: 0, count: 0 } });
            return null;
        }
    }, []);

    const loadActiveBuild = useCallback(async () => {
        const userId = getUserId(user);
        if (!isAuthenticated || !userId) return null;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/builds/active');
            const active = response.data?.active_build;
            const list = response.data?.builds || [];

            let buildToUse = active;
            if (!buildToUse) {
                buildToUse = await createNewBuild();
            }

            setCurrentBuild(buildToUse);
            setBuildsList(list);
            await fetchBuildDetails(getBuildId(buildToUse));
            return buildToUse;
        } catch (err) {
            console.error('Failed to load active build:', err);
            setError('Could not load or initialize the PC build.');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user, fetchBuildDetails]);

    const addComponent = async (partId, category) => {
        setError(null);
        let buildId = getBuildId(currentBuild);
        if (!buildId) {
            const loaded = await loadActiveBuild();
            buildId = getBuildId(loaded);
        }
        if (!buildId) return { success: false, error: 'Build not loaded yet. Please retry.' };

        try {
            const response = await apiClient.post(`/builds/${buildId}/add`, {
                part_id: partId,
                category,
                quantity: 1
            });
            setCurrentBuild(response.data);
            await fetchBuildDetails(getBuildId(response.data));
            return { success: true };
        } catch (err) {
            const compatibilityError = err.response?.data?.detail || err.response?.data?.message || err.response?.statusText || err.message || 'An unknown error occurred.';
            setError(compatibilityError);
            return { success: false, error: compatibilityError };
        }
    };

    const removeComponent = async (partId) => {
        setError(null);
        let buildId = getBuildId(currentBuild);
        if (!buildId) {
            const loaded = await loadActiveBuild();
            buildId = getBuildId(loaded);
        }
        if (!buildId) return { success: false, error: 'Build not loaded yet. Please retry.' };

        try {
            const response = await apiClient.delete(`/builds/${buildId}/remove/${partId}`);
            setCurrentBuild(response.data);
            await fetchBuildDetails(getBuildId(response.data));
            return { success: true };
        } catch (err) {
            console.error('Failed to remove component:', err);
            const message = err.response?.data?.detail || 'Failed to remove component.';
            setError(message);
            return { success: false, error: message };
        }
    };

    const value = {
        currentBuild,
        buildsList,
        buildDetails,
        isLoading,
        error,
        loadActiveBuild,
        fetchBuildDetails,
        addComponent,
        removeComponent,
        isPartInBuild: (partId) => currentBuild?.components.some(item => item.part_id === partId)
    };

    useEffect(() => {
        if (isAuthenticated && getUserId(user)) {
            loadActiveBuild();
        } else {
            setCurrentBuild(null);
            setBuildDetails({ parts: [], compatibility: { status: 'success', issues: [] }, totals: { price: 0, count: 0 } });
            setBuildsList([]);
            setIsLoading(false);
        }
        // We intentionally exclude loadActiveBuild to avoid effect thrash from
        // function identity changes. Dependencies are only auth and user id.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    return (
        <BuildContext.Provider value={value}>
            {children}
        </BuildContext.Provider>
    );
};