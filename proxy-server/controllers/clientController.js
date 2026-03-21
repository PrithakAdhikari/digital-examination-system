import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import Client from "../models/Client.js";
import Question from "../models/Question.js";

/**
 * Registers a new client (Examination PC).
 */
export const registerClient = async (req, res) => {
  const { device_id } = req.body;

  if (!device_id) {
    return res.status(400).json({ error: "device_id is required" });
  }

  try {
    // Check if client already exists
    let client = await Client.findOne({ where: { device_id } });

    if (client) {
      return res.status(200).json({
        client_id: client.client_id,
        client_physical_id: client.client_physical_id,
        token: client.token,
      });
    }

    // Get count of existing clients to generate physical ID
    const clientCount = await Client.count();
    const client_physical_id = `PC-${clientCount + 1}`;

    // Create new client
    client = await Client.create({
      device_id,
      client_physical_id,
      client_id: uuidv4(),
      token: uuidv4(),
      status: "online",
      last_heartbeat: new Date(),
    });

    res.status(201).json({
      client_id: client.client_id,
      client_physical_id: client.client_physical_id,
      token: client.token,
    });
  } catch (err) {
    console.error("Error registering client:", err.message);
    res.status(500).json({ error: "Failed to register client: " + err.message });
  }
};

/**
 * Returns all locally stored questions for the client.
 */
export const getQuestionForClient = async (req, res) => {
  try {
    const questions = await Question.findAll({ order: [['id', 'ASC']] });
    res.status(200).json({ data: questions });
  } catch (err) {
    res.status(500).json({ error: "Error fetching questions for client: " + err.message });
  }
};

/**
 * Updates the heartbeat and status of a client.
 */
export const heartbeat = async (req, res) => {
  const { client_id } = req.params;

  try {
    const client = await Client.findOne({ where: { client_id } });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await client.update({
      status: "online",
      last_heartbeat: new Date(),
    });

    res.status(200).json({ message: "Heartbeat received" });
  } catch (err) {
    res.status(500).json({ error: "Error processing heartbeat: " + err.message });
  }
};

/**
 * Returns all registered clients for the Proxy UI.
 */
export const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ data: clients });
  } catch (err) {
    res.status(500).json({ error: "Error fetching clients: " + err.message });
  }
};

/**
 * Deletes a client.
 */
export const deleteClient = async (req, res) => {
  const { client_id } = req.params;

  try {
    const client = await Client.findOne({ where: { client_id } });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await client.destroy();

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting client: " + err.message });
  }
};

/**
 * Background task to monitor client heartbeats and mark them offline.
 */
export const monitorHeartbeats = async () => {
    try {
        const timeoutThreshold = 30 * 1000; // 30 seconds
        const now = new Date();
        
        const offlineThreshold = new Date(now.getTime() - timeoutThreshold);

        // Find all online clients that haven't sent a heartbeat recently
        const [affectedCount] = await Client.update(
            { status: "offline" },
            {
                where: {
                    status: "online",
                    last_heartbeat: {
                        [Op.lt]: offlineThreshold
                    }
                }
            }
        );

        if (affectedCount > 0) {
            console.log(`[Heartbeat Monitor] Marked ${affectedCount} clients as offline.`);
        }
    } catch (err) {
        console.error("[Heartbeat Monitor] Error monitoring heartbeats:", err.message);
    }
};
