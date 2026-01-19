import { supabase, Workflow } from './supabase';
import { Node, Edge } from 'reactflow';

export interface SaveWorkflowParams {
    name: string;
    description?: string;
    nodes: Node[];
    edges: Edge[];
    workspace?: string;
}

export interface UpdateWorkflowParams extends SaveWorkflowParams {
    id: string;
}

/**
 * Save a new workflow to the database
 */
export async function saveWorkflow(params: SaveWorkflowParams): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .insert({
                name: params.name,
                description: params.description,
                nodes: params.nodes,
                edges: params.edges,
                version: '1.0',
                workspace: params.workspace || 'default',
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving workflow:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
            alert(`Failed to save workflow: ${error.message || 'Unknown error'}\n\nHint: ${error.hint || 'Check console for details'}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error saving workflow:', error);
        return null;
    }
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(params: UpdateWorkflowParams): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .update({
                name: params.name,
                description: params.description,
                nodes: params.nodes,
                edges: params.edges,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating workflow:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
            alert(`Failed to update workflow: ${error.message || 'Unknown error'}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error updating workflow:', error);
        return null;
    }
}

/**
 * Load a workflow by ID
 */
export async function loadWorkflow(id: string): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error loading workflow:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error loading workflow:', error);
        return null;
    }
}

/**
 * List all workflows
 */
export async function listWorkflows(): Promise<Workflow[]> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error listing workflows:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error listing workflows:', error);
        return [];
    }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting workflow:', error);
        return false;
    }
}

/**
 * Save workflow execution result
 */
export async function saveWorkflowExecution(
    workflowId: string,
    requestData: any,
    responseData: any,
    status: 'success' | 'failed'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflow_executions')
            .insert({
                workflow_id: workflowId,
                request_data: requestData,
                response_data: responseData,
                status,
            });

        if (error) {
            console.error('Error saving execution:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving execution:', error);
        return false;
    }
}

/**
 * Deploy a workflow (make it accessible via HTTP)
 */
export async function deployWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .update({
                deployed: true,
                deployed_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('Error deploying workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deploying workflow:', error);
        return false;
    }
}

/**
 * Undeploy a workflow (remove HTTP access)
 */
export async function undeployWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .update({
                deployed: false,
            })
            .eq('id', id);

        if (error) {
            console.error('Error undeploying workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error undeploying workflow:', error);
        return false;
    }
}

/**
 * Find a deployed workflow by workspace, path and method
 */
export async function getWorkflowByPath(workspace: string, path: string, method: string): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('deployed', true)
            .eq('workspace', workspace)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching workflows:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log(`[MockFlow] No deployed workflows found for workspace: ${workspace}`);
            return null;
        }

        // Find workflow with matching Request node
        for (const workflow of data) {
            const requestNode = workflow.nodes.find((node: any) => {
                console.log('[MockFlow] Checking node:', {
                    type: node.type,
                    path: node.data?.path,
                    method: node.data?.method,
                    lookingFor: { workspace, path, method }
                });

                return node.type === 'request' &&
                    node.data.path === path &&
                    (node.data.method === method || node.data.method === 'ANY');
            });

            if (requestNode) {
                console.log('[MockFlow] ✅ Found matching workflow:', {
                    workflowName: workflow.name,
                    workspace: workflow.workspace,
                    requestMethod: requestNode.data.method,
                    requestPath: requestNode.data.path
                });
                return workflow;
            }
        }

        return null;
    } catch (error) {
        console.error('Error finding workflow by path:', error);
        return null;
    }
}

